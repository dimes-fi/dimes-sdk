import { describe, it, expect, vi } from "vitest";
import { DimesApiError } from "../src/errors/dimes-error";
import { executeQuote, type QuoteClient } from "../src/quote/quote";
import type { Quote } from "../src/types";

function mockQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    id: "dm_off_123",
    authorityPublicKey: "0x1234",
    collateralUsdcUnits: "1000000",
    contractSignature: "0xsig",
    currentLiquidationPriceUsd: "0.30",
    currentLiquidationPriceUsdPips: "3000",
    effectiveSide: "yes",
    entryPriceUsd: "0.50",
    entryPriceUsdPips: "5000",
    evmChainId: "137",
    expectedOpenTradingFeeUsd: "0.01",
    expectedOpenTradingFeeUsdPips: "100",
    expectedOpenTradingFeeUsdcUnits: "10000",
    expiresAt: "2025-01-01T00:00:00Z",
    leverageBps: 20000,
    lifetimeFeeAprBps: 2000,
    liquidationFeeBps: 250,
    marketTicker: "TRUMP-WIN",
    minExpectedPositionTokenUnits: "9900000",
    notionalAmountUsd: "5.00",
    notionalAmountUsdPips: "50000",
    notionalUsdcUnits: "5000000",
    onChainPositionKey: "0xkey",
    originationFeeBps: 100,
    originationFeeUsd: "0.05",
    originationFeeUsdPips: "500",
    originationFeeUsdcUnits: "50000",
    partnerOriginationFeeBps: 25,
    partnerOriginationFeeUsd: "0.01",
    partnerOriginationFeeUsdPips: "100",
    partnerOriginationFeeUsdcUnits: "10000",
    polygonVaultContractAddress: "0xvault",
    polymarketMarketId: "0xmarket",
    polymarketTokenId: "12345",
    polymarketTradingFeeBps: 100,
    positionSeed: "seed123",
    positionSeedHex: "0xseed",
    protocolOriginationFeeBps: 75,
    protocolOriginationFeeUsd: "0.04",
    protocolOriginationFeeUsdPips: "400",
    protocolOriginationFeeUsdcUnits: "40000",
    provider: "polymarket",
    signatureExpiry: "1700000000",
    slippageBps: 200,
    totalUserAmountUsd: "2.55",
    totalUserAmountUsdPips: "25500",
    totalUserAmountUsdcUnits: "2550000",
    ...overrides,
  };
}

function mockClient(overrides: Partial<QuoteClient> = {}): QuoteClient {
  return {
    createDraftQuote: vi.fn().mockImplementation(() => Promise.resolve(mockQuote({ id: "dm_dro_draft" }))),
    promoteDraftQuote: vi.fn().mockImplementation(() => Promise.resolve(mockQuote({ id: "dm_off_promoted" }))),
    createQuote: vi.fn().mockImplementation(() => Promise.resolve(mockQuote({ id: "dm_off_corrected" }))),
    ...overrides,
  };
}

describe("executeQuote", () => {
  const params = {
    marketTicker: "TRUMP-WIN",
    side: "yes" as const,
    collateralUsd: 100,
    leverageBps: 20000,
    slippageBps: 200,
  };

  it("happy path: draft -> promote -> return", async () => {
    const client = mockClient();
    const result = await executeQuote(client, params);

    expect(client.createDraftQuote).toHaveBeenCalledOnce();
    expect(client.promoteDraftQuote).toHaveBeenCalledWith("dm_dro_draft", { riskMode: undefined });
    expect(result.quote.id).toBe("dm_off_promoted");
    expect(result.corrections).toHaveLength(0);
    expect(result.retries).toBe(0);
  });

  it("fires onDraftReady callback", async () => {
    const client = mockClient();
    const onDraftReady = vi.fn();
    await executeQuote(client, params, { onDraftReady });

    expect(onDraftReady).toHaveBeenCalledWith(expect.objectContaining({ id: "dm_dro_draft" }));
  });

  it("retries on market-moved error", async () => {
    const promoteMock = vi
      .fn()
      .mockRejectedValueOnce(
        new DimesApiError({
          status: 400,
          code: "quote_slippage_too_high",
          type: "invalid_request_error",
          message: "slippage",
          params: null,
        }),
      )
      .mockResolvedValueOnce(mockQuote({ id: "dm_off_retry" }));

    const client = mockClient({ promoteDraftQuote: promoteMock });
    const onMarketMoved = vi.fn();
    const result = await executeQuote(client, params, { onMarketMoved });

    expect(result.quote.id).toBe("dm_off_retry");
    expect(result.retries).toBe(1);
    expect(onMarketMoved).toHaveBeenCalledOnce();
  });

  it("aborts on market-moved when callback returns false", async () => {
    const promoteMock = vi.fn().mockRejectedValue(
      new DimesApiError({
        status: 400,
        code: "quote_insufficient_liquidity",
        type: "invalid_request_error",
        message: "no liquidity",
        params: null,
      }),
    );

    const client = mockClient({ promoteDraftQuote: promoteMock });

    await expect(executeQuote(client, params, { onMarketMoved: () => false })).rejects.toThrow(DimesApiError);
  });

  it("auto-corrects leverage and uses createQuote directly", async () => {
    const promoteMock = vi.fn().mockRejectedValue(
      new DimesApiError({
        status: 400,
        code: "quote_leverage_exceeds_maximum",
        type: "invalid_request_error",
        message: "too high",
        params: { maxLeverageBps: 30000, currentLeverageBps: 50000 },
      }),
    );

    const client = mockClient({ promoteDraftQuote: promoteMock });
    const onCorrection = vi.fn();
    const result = await executeQuote(client, { ...params, leverageBps: 50000 }, { onCorrection });

    expect(result.quote.id).toBe("dm_off_corrected");
    expect(result.corrections).toHaveLength(1);
    expect(result.corrections[0]!.field).toBe("leverage");
    expect(result.corrections[0]!.toValue).toBe(30000);
    expect(onCorrection).toHaveBeenCalledOnce();
    expect(client.createQuote).toHaveBeenCalledOnce();
  });

  it("auto-corrects min-fill by enabling partial fill", async () => {
    const promoteMock = vi.fn().mockRejectedValue(
      new DimesApiError({
        status: 400,
        code: "quote_min_fill_bps_below_floor",
        type: "invalid_request_error",
        message: "min fill too low",
        params: { floorMinFillBps: 3000 },
      }),
    );

    const client = mockClient({ promoteDraftQuote: promoteMock });
    const result = await executeQuote(client, { ...params, allowPartialFill: true, minFillBps: 2000 });

    expect(result.corrections).toHaveLength(1);
    expect(result.corrections[0]!.field).toBe("minFill");
    expect(result.corrections[0]!.toValue).toBe(3000);
    expect(client.createQuote).toHaveBeenCalledWith(
      expect.objectContaining({ allowPartialFill: true, minFillBps: 3000 }),
    );
  });

  it("throws non-correctable errors", async () => {
    const promoteMock = vi.fn().mockRejectedValue(
      new DimesApiError({
        status: 400,
        code: "quote_market_not_found",
        type: "invalid_request_error",
        message: "not found",
        params: null,
      }),
    );

    const client = mockClient({ promoteDraftQuote: promoteMock });

    await expect(executeQuote(client, params)).rejects.toThrow(DimesApiError);
  });

  it("skips auto-correct when autoCorrect is false", async () => {
    const promoteMock = vi.fn().mockRejectedValue(
      new DimesApiError({
        status: 400,
        code: "quote_leverage_exceeds_maximum",
        type: "invalid_request_error",
        message: "too high",
        params: { maxLeverageBps: 30000 },
      }),
    );

    const client = mockClient({ promoteDraftQuote: promoteMock });

    await expect(executeQuote(client, params, { autoCorrect: false })).rejects.toThrow(DimesApiError);
    expect(client.createQuote).not.toHaveBeenCalled();
  });
});
