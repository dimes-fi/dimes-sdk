import { decamelizeKeys } from "humps";
import type {
  ContractInfo,
  CreateOfferParams,
  CustomerLimit,
  FeeRates,
  FeeReport,
  FeeReportParams,
  Market,
  Offer,
  Paginated,
  Position,
  PositionTransactions,
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

export interface GetMarketsParams {
  cursor?: string;
  limit?: number;
  category?: string;
  status?: string;
  provider?: "polymarket" | "kalshi";
  sort?: MarketSort;
}

export interface GetPositionsParams {
  cursor?: string;
  limit?: number;
  status?: "open" | "closed";
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
  private readonly http: HttpClient;

  constructor(options: DimesClientOptions) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl ?? "https://api.dimes.fi",
      auth: options.auth,
      fetch: options.fetch,
      maxRetries: options.maxRetries,
      maxRetryDelayMs: options.maxRetryDelayMs,
    });
  }

  public async getMarkets(params?: GetMarketsParams): Promise<Paginated<Market>> {
    const query = params ? buildQueryFromEntries(Object.entries(params)) : "";
    return this.http.request<Paginated<Market>>(`/v1/prediction-markets/markets${query}`);
  }

  public async getMarket(ticker: string): Promise<Market> {
    return this.http.request<Market>(`/v1/prediction-markets/markets/${encodeURIComponent(ticker)}`);
  }

  public async createDraftQuote(params: CreateOfferParams): Promise<Offer> {
    return this.http.request<Offer>("/v1/prediction-markets/draft-quotes", {
      method: "POST",
      body: JSON.stringify(decamelizeKeys(params)),
    });
  }

  public async promoteDraftQuote(draftId: string): Promise<Offer> {
    return this.http.request<Offer>(`/v1/prediction-markets/promoted-quotes/${encodeURIComponent(draftId)}`, {
      method: "POST",
    });
  }

  public async createQuote(params: CreateOfferParams): Promise<Offer> {
    return this.http.request<Offer>("/v1/prediction-markets/quotes", {
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
    await this.http.request<unknown>(`/v1/prediction-markets/positions/${encodeURIComponent(positionId)}/cancel`, {
      method: "POST",
    });
  }

  public async getContractInfo(): Promise<ContractInfo> {
    return this.http.request<ContractInfo>("/v1/prediction-markets/contract-info");
  }

  public async getLimits(): Promise<CustomerLimit> {
    return this.http.request<CustomerLimit>("/v1/prediction-markets/limits");
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
