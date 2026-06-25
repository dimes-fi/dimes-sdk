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
  PositionTransactions,
  Quote,
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
}

export interface SearchMarketsParams extends GetMarketsParams {
  query: string;
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

  public async searchMarkets(params: SearchMarketsParams): Promise<Paginated<Market>> {
    const query = buildQueryFromEntries(Object.entries(params));
    return this.http.request<Paginated<Market>>(`/v1/prediction-markets/markets/search${query}`);
  }

  public async createDraftQuote(params: CreateQuoteParams): Promise<Quote> {
    return this.http.request<Quote>("/v1/prediction-markets/draft-quotes", {
      method: "POST",
      body: JSON.stringify(decamelizeKeys(params)),
    });
  }

  public async promoteDraftQuote(draftId: string): Promise<Quote> {
    return this.http.request<Quote>(`/v1/prediction-markets/promoted-quotes/${encodeURIComponent(draftId)}`, {
      method: "POST",
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

  public async getPositionTransactions(positionId: string): Promise<PositionTransactions> {
    return this.http.request<PositionTransactions>(
      `/v1/prediction-markets/positions/${encodeURIComponent(positionId)}/transactions`,
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
