import { describe, it, expect } from "vitest";
import { buildQuoteParams } from "../src/quote/build-quote-params";

describe("buildQuoteParams", () => {
  it("rounds leverage to nearest step", () => {
    const result = buildQuoteParams({
      marketTicker: "TRUMP-WIN",
      side: "yes",
      collateralUsd: 100,
      leverageBps: 21000,
      slippageBps: 200,
    });

    expect(result.leverageBps).toBe(20000);
  });

  it("rounds leverage up when closer to upper step", () => {
    const result = buildQuoteParams({
      marketTicker: "TRUMP-WIN",
      side: "yes",
      collateralUsd: 100,
      leverageBps: 23000,
      slippageBps: 200,
    });

    expect(result.leverageBps).toBe(22500);
  });

  it("computes notional as collateral * leverageBps", () => {
    const result = buildQuoteParams({
      marketTicker: "TRUMP-WIN",
      side: "no",
      collateralUsd: 50,
      leverageBps: 20000,
      slippageBps: 100,
    });

    expect(result.notionalAmountUsdPips).toBe("1000000");
  });

  it("uses custom step", () => {
    const result = buildQuoteParams(
      {
        marketTicker: "TRUMP-WIN",
        side: "yes",
        collateralUsd: 100,
        leverageBps: 15000,
        slippageBps: 200,
      },
      5000,
    );

    expect(result.leverageBps).toBe(15000);
  });

  it("omits partial-fill fields when not provided", () => {
    const result = buildQuoteParams({
      marketTicker: "ETH-10K",
      side: "yes",
      collateralUsd: 10,
      leverageBps: 50000,
      slippageBps: 300,
    });

    expect(result.allowPartialFill).toBeUndefined();
    expect(result.minFillBps).toBeUndefined();
  });

  it("passes partial-fill fields through when provided", () => {
    const result = buildQuoteParams({
      marketTicker: "ETH-10K",
      side: "yes",
      collateralUsd: 10,
      leverageBps: 50000,
      slippageBps: 300,
      allowPartialFill: true,
      minFillBps: 2500,
    });

    expect(result.allowPartialFill).toBe(true);
    expect(result.minFillBps).toBe(2500);
  });

  it("drops minFillBps when allowPartialFill is not true", () => {
    const result = buildQuoteParams({
      marketTicker: "ETH-10K",
      side: "yes",
      collateralUsd: 10,
      leverageBps: 50000,
      slippageBps: 300,
      allowPartialFill: false,
      minFillBps: 2500,
    });

    expect(result.allowPartialFill).toBe(false);
    expect(result.minFillBps).toBeUndefined();
  });

  it("omits riskMode when not provided, so the wire body stays as it was", () => {
    const result = buildQuoteParams({
      marketTicker: "ETH-10K",
      side: "yes",
      collateralUsd: 10,
      leverageBps: 20000,
      slippageBps: 300,
    });

    expect("riskMode" in result).toBe(false);
  });

  it("passes riskMode through so the quote machine's rebuild cannot drop it", () => {
    const result = buildQuoteParams({
      marketTicker: "ETH-10K",
      side: "yes",
      collateralUsd: 10,
      leverageBps: 20000,
      slippageBps: 300,
      riskMode: "committed",
    });

    expect(result.riskMode).toBe("committed");
  });

  it("passes marketTicker and effectiveSide through", () => {
    const result = buildQuoteParams({
      marketTicker: "ETH-10K",
      side: "no",
      collateralUsd: 10,
      leverageBps: 50000,
      slippageBps: 300,
    });

    expect(result.marketTicker).toBe("ETH-10K");
    expect(result.effectiveSide).toBe("no");
    expect(result.slippageBps).toBe(300);
  });
});
