import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthProvider } from "../src/client/auth";
import { DimesClient } from "../src/client/dimes-client";

function createMockFetch(responseBody: unknown = { data: [] }) {
  return vi.fn<typeof globalThis.fetch>().mockResolvedValue(
    new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function createClient(mockFetch: ReturnType<typeof createMockFetch>) {
  const auth: AuthProvider = {
    getHeaders: vi.fn().mockResolvedValue({ Authorization: "Bearer test-token" }),
  };
  return new DimesClient({
    baseUrl: "https://test.api",
    auth,
    fetch: mockFetch,
  });
}

describe("DimesClient", () => {
  let mockFetch: ReturnType<typeof createMockFetch>;
  let client: DimesClient;

  beforeEach(() => {
    mockFetch = createMockFetch({ data: [], has_more: false });
    client = createClient(mockFetch);
  });

  it("getMarkets — calls GET /v1/prediction-markets/markets", async () => {
    await client.getMarkets();
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://test.api/v1/prediction-markets/markets");
    expect(opts?.method).toBeUndefined(); // GET is the default
  });

  it("getMarkets with params — serializes query params (camelCase to snake_case)", async () => {
    await client.getMarkets({ category: "politics", limit: 10 });
    const [url] = mockFetch.mock.calls[0];
    const urlStr = String(url);
    expect(urlStr).toContain("category=politics");
    expect(urlStr).toContain("limit=10");
  });

  it("getMarket — calls GET /v1/prediction-markets/markets/:ticker with URL encoding", async () => {
    mockFetch = createMockFetch({ ticker: "SOME-MARKET" });
    client = createClient(mockFetch);
    await client.getMarket("SOME MARKET");
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/markets/SOME%20MARKET");
  });

  it("createDraftQuote — calls POST /v1/prediction-markets/draft-quotes with decamelized body", async () => {
    mockFetch = createMockFetch({ id: "draft_123" });
    client = createClient(mockFetch);
    await client.createDraftQuote({
      marketTicker: "TRUMP-WIN",
      effectiveSide: "yes",
      leverageBps: 20000,
      notionalAmountUsdPips: "50000",
      slippageBps: 100,
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/draft-quotes");
    expect(opts?.method).toBe("POST");
    const body = JSON.parse(opts?.body as string);
    expect(body.market_ticker).toBe("TRUMP-WIN");
    expect(body.effective_side).toBe("yes");
    expect(body.leverage_bps).toBe(20000);
    expect(body.notional_amount_usd_pips).toBe("50000");
    expect(body.slippage_bps).toBe(100);
  });

  it("promoteDraftQuote — calls POST /v1/prediction-markets/promoted-quotes/:id", async () => {
    mockFetch = createMockFetch({ id: "promoted_123" });
    client = createClient(mockFetch);
    await client.promoteDraftQuote("draft_123");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/promoted-quotes/draft_123");
    expect(opts?.method).toBe("POST");
  });

  it("createQuote — calls POST /v1/prediction-markets/quotes with decamelized body", async () => {
    mockFetch = createMockFetch({ id: "quote_123" });
    client = createClient(mockFetch);
    await client.createQuote({
      marketTicker: "TRUMP-WIN",
      effectiveSide: "no",
      leverageBps: 10000,
      notionalAmountUsdPips: "25000",
      slippageBps: 50,
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/quotes");
    expect(opts?.method).toBe("POST");
    const body = JSON.parse(opts?.body as string);
    expect(body.market_ticker).toBe("TRUMP-WIN");
    expect(body.effective_side).toBe("no");
  });

  it("getPositions — calls GET /v1/prediction-markets/positions", async () => {
    await client.getPositions();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/positions");
  });

  it("cancelPosition — calls DELETE /v1/prediction-markets/positions/:id", async () => {
    await client.cancelPosition("pos_456");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/positions/pos_456");
    expect(opts?.method).toBe("DELETE");
  });

  it("getContractInfo — calls GET /v1/prediction-markets/contract-info", async () => {
    mockFetch = createMockFetch({ router_address: "0x123" });
    client = createClient(mockFetch);
    await client.getContractInfo();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/contract-info");
  });

  it("getUserLimits — calls GET /v1/prediction-markets/user-limits", async () => {
    mockFetch = createMockFetch({ max_notional: "1000" });
    client = createClient(mockFetch);
    await client.getUserLimits();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/user-limits");
  });

  it("getPartnerLimits — calls GET /v1/prediction-markets/partner-limits", async () => {
    mockFetch = createMockFetch({ max_notional: "1000" });
    client = createClient(mockFetch);
    await client.getPartnerLimits();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/partner-limits");
  });

  it("getLimits — deprecated alias resolves to user-limits", async () => {
    mockFetch = createMockFetch({ max_notional: "1000" });
    client = createClient(mockFetch);
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- intentionally exercising the deprecated alias
    await client.getLimits();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toBe("https://test.api/v1/prediction-markets/user-limits");
  });

  it("custom fetch is forwarded to HttpClient", async () => {
    const customFetch = createMockFetch({ data: [], has_more: false });
    const auth: AuthProvider = {
      getHeaders: vi.fn().mockResolvedValue({ Authorization: "Bearer tk" }),
    };
    const c = new DimesClient({ baseUrl: "https://custom.api", auth, fetch: customFetch });
    await c.getMarkets();
    expect(customFetch).toHaveBeenCalledOnce();
    expect(String(customFetch.mock.calls[0][0])).toContain("https://custom.api");
  });
});
