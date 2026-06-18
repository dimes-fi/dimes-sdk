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
