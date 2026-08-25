import { decamelizeKeys } from "humps";
import type {
  ContractInfo,
  CreateQuoteParams,
  CustomerLimit,
  FeeRates,
  FeeReport,
  FeeReportParams,
  Market,
  Paginated,
  Position,
  PositionPartialCloseList,
  PositionUnwindList,
  PositionTransactions,
  Quote,
  RiskMode,
} from "../types";
import type { AuthProvider } from "./auth";
import { HttpClient } from "./http";

export interface DimesClientOptions {
  baseUrl?: string;
  auth: AuthProvider;
  fetch?: typeof globalThis.fetch;
  maxRetries?: number;
  maxRetryDelayMs?: number;
}

export type MarketSort = "ticker_asc" | "depth_desc" | "discovered_at_desc";

export type MarketExpand = "total_count" | "prices";

export type PositionStatus = "open" | "unwinding" | "pending" | "closing" | "closed" | "settled" | "liquidated";

export interface GetMarketsParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  expand?: MarketExpand[];
  sort?: MarketSort;
  acceptingNewPositions?: boolean;
  category?: string;
  status?: string;
  provider?: "polymarket" | "kalshi";
  /** Free-text search across market tickers and titles. */
  query?: string;
}

/** @deprecated Use {@link GetMarketsParams} with `query` and {@link DimesClient.getMarkets}. */
export interface SearchMarketsParams extends GetMarketsParams {
  query: string;
}

export interface PromoteDraftQuoteParams {
  riskMode?: RiskMode;
}

export interface GetPositionUnwindsParams {
  status?: "executed" | "planned" | "all";
}

export interface GetPositionsParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  expand?: string[];
  sortBy?: "created_at" | "closed_at";
  sortDirection?: "asc" | "desc";
  status?: PositionStatus;
  state?: "active" | "inactive";
}

export interface GetFeeRatesParams {
  ticker?: string;
}

function buildQueryFromEntries(entries: [string, unknown][]): string {
  const filtered = entries.filter(([, v]) => v !== undefined && v !== null);
  if (filtered.length === 0) {
    return "";
  }

  const search = new URLSearchParams();
  for (const [key, value] of filtered) {
    search.set(
      key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
      String(value),
    );
  }

  return `?${search.toString()}`;
}

export class DimesClient {
  /** The resolved API base URL. Useful for constructing WebSocket clients against the same host. */
  public readonly baseUrl: string;

  private readonly http: HttpClient;

  private readonly auth: AuthProvider;

  constructor(options: DimesClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.dimes.fi";
    this.auth = options.auth;
    this.http = new HttpClient({
      baseUrl: this.baseUrl,
      auth: options.auth,
      fetch: options.fetch,
      maxRetries: options.maxRetries,
      maxRetryDelayMs: options.maxRetryDelayMs,
    });
  }

  /** Synchronously return the current cached JWT, or null. Returns null if the auth provider does not expose one. */
  public getToken(): string | null {
    return this.auth.getToken?.() ?? null;
  }

  public async getMarkets(params?: GetMarketsParams): Promise<Paginated<Market>> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.request<Paginated<Market>>(`/v1/prediction-markets/markets${query}`);
  }

  public async getMarket(ticker: string): Promise<Market> {
    return this.http.request<Market>(`/v1/prediction-markets/markets/${encodeURIComponent(ticker)}`);
  }

  /**
   * Markets belonging to one event — the real-world happening a market resolves against, such as a
   * single game or one hourly price window. Read the ticker from `market.event.ticker`.
   *
   * Accepts the same params as {@link getMarkets} and returns the same market objects.
   */
  public async getEventMarkets(eventTicker: string, params?: GetMarketsParams): Promise<Paginated<Market>> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.request<Paginated<Market>>(
      `/v1/prediction-markets/events/${encodeURIComponent(eventTicker)}/markets${query}`,
    );
  }

  /**
   * Markets belonging to one series, across every event in it — a series is the recurring template an
   * event comes from, such as the 5-minute BTC up/down series. Read the ticker from
   * `market.event.seriesTicker`, which is null for events with no series.
   *
   * Accepts the same params as {@link getMarkets}. A series commonly holds more markets than fit on one
   * page, so paginate with `startingAfter`.
   */
  public async getSeriesMarkets(seriesTicker: string, params?: GetMarketsParams): Promise<Paginated<Market>> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.request<Paginated<Market>>(
      `/v1/prediction-markets/series/${encodeURIComponent(seriesTicker)}/markets${query}`,
    );
  }

  /**
   * @deprecated The `/markets/search` path is deprecated. Use {@link getMarkets} with a `query` param:
   * `getMarkets({ query: "bitcoin" })`.
   */
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- this IS the deprecated method
  public async searchMarkets(params: SearchMarketsParams): Promise<Paginated<Market>> {
    return this.getMarkets(params);
  }

  public async createDraftQuote(params: CreateQuoteParams): Promise<Quote> {
    return this.http.request<Quote>("/v1/prediction-markets/draft-quotes", {
      method: "POST",
      body: JSON.stringify(decamelizeKeys(params)),
    });
  }

  /**
   * Promote a draft into a real, signed quote.
   *
   * A draft carries no risk mode at all — sending `riskMode` on the draft body does nothing, and a
   * draft always reports adaptive terms. The mode the position actually opens in is chosen here, and
   * omitting it means adaptive, so a client that showed the user committed terms from the draft's
   * `committedUnwinds` must repeat the choice at promotion or it will get adaptive terms.
   */
  public async promoteDraftQuote(draftId: string, params?: PromoteDraftQuoteParams): Promise<Quote> {
    return this.http.request<Quote>(`/v1/prediction-markets/promoted-quotes/${encodeURIComponent(draftId)}`, {
      method: "POST",
      body: JSON.stringify(decamelizeKeys(params ?? {})),
    });
  }

  public async createQuote(params: CreateQuoteParams): Promise<Quote> {
    return this.http.request<Quote>("/v1/prediction-markets/quotes", {
      method: "POST",
      body: JSON.stringify(decamelizeKeys(params)),
    });
  }

  public async getPositions(params?: GetPositionsParams): Promise<Position[]> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.requestList<Position>(`/v1/prediction-markets/positions${query}`);
  }

  /** Your positions on a single market. Accepts the same params as {@link getPositions}. */
  public async getMarketPositions(ticker: string, params?: GetPositionsParams): Promise<Position[]> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.requestList<Position>(
      `/v1/prediction-markets/markets/${encodeURIComponent(ticker)}/positions${query}`,
    );
  }

  /** Your positions across every market on one event. Accepts the same params as {@link getPositions}. */
  public async getEventPositions(eventTicker: string, params?: GetPositionsParams): Promise<Position[]> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.requestList<Position>(
      `/v1/prediction-markets/events/${encodeURIComponent(eventTicker)}/positions${query}`,
    );
  }

  /** Your positions across every market in one series, spanning all of its events. */
  public async getSeriesPositions(seriesTicker: string, params?: GetPositionsParams): Promise<Position[]> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.requestList<Position>(
      `/v1/prediction-markets/series/${encodeURIComponent(seriesTicker)}/positions${query}`,
    );
  }

  public async getPositionTransactions(positionId: string): Promise<PositionTransactions> {
    return this.http.request<PositionTransactions>(
      `/v1/prediction-markets/positions/${encodeURIComponent(positionId)}/transactions`,
    );
  }

  /**
   * Deleverage history for a position, and — for committed-mode positions — the signed ladder.
   *
   * `status` defaults to `executed` (unwinds that already landed on-chain). Ask for `planned` to get
   * the ladder rungs instead, or `all` for both. Rung rows carry `triggerPriceUsdPips` and a `status`
   * of `planned`, `triggered` (its price was reached) or `superseded` (a partial close put the
   * position below its target, so it can never fire).
   */
  public async getPositionUnwinds(positionId: string, params?: GetPositionUnwindsParams): Promise<PositionUnwindList> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.request<PositionUnwindList>(
      `/v1/prediction-markets/positions/${encodeURIComponent(positionId)}/unwinds${query}`,
    );
  }

  public async getPositionPartialCloses(positionId: string): Promise<PositionPartialCloseList> {
    return this.http.request<PositionPartialCloseList>(
      `/v1/prediction-markets/positions/${encodeURIComponent(positionId)}/partial-closes`,
    );
  }

  public async cancelPosition(positionId: string): Promise<void> {
    await this.http.request<unknown>(`/v1/prediction-markets/positions/${encodeURIComponent(positionId)}`, {
      method: "DELETE",
    });
  }

  public async getContractInfo(): Promise<ContractInfo> {
    return this.http.request<ContractInfo>("/v1/prediction-markets/contract-info");
  }

  public async getUserLimits(): Promise<CustomerLimit> {
    return this.http.request<CustomerLimit>("/v1/prediction-markets/user-limits");
  }

  public async getPartnerLimits(): Promise<CustomerLimit> {
    return this.http.request<CustomerLimit>("/v1/prediction-markets/partner-limits");
  }

  /**
   * @deprecated The `/limits` path was never served by the API. Use {@link getUserLimits}
   * (JWT/user context) or {@link getPartnerLimits} (API-key/partner context). This alias
   * forwards to `getUserLimits` and will be removed in a future major.
   */
  public async getLimits(): Promise<CustomerLimit> {
    return this.getUserLimits();
  }

  public async getFeeRates(params?: GetFeeRatesParams): Promise<FeeRates> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.request<FeeRates>(`/v1/prediction-markets/fee-rates${query}`);
  }

  public async getFeeReport(params: FeeReportParams): Promise<FeeReport> {
    return this.http.request<FeeReport>("/v1/prediction-markets/fee-reports", {
      method: "POST",
      body: JSON.stringify(decamelizeKeys(params)),
    });
  }
}
