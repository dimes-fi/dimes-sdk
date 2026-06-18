import { describe, expect, it } from "vitest";
import {
  computeOriginationFeeUsdcUnits,
  resolveOriginationFeeBps,
  resolveProtocolOriginationFeeBps,
} from "../src/utils/fees";
import {
  computeMaxGain,
  computePolymarketTradingFee,
  estimateLiquidationPrice,
  expectedPositionTokenUnits,
} from "../src/utils/max-gain";

const referenceTiers = [
  { maxLeverageBps: 40_000, feeBps: 200 },
  { maxLeverageBps: 70_000, feeBps: 225 },
  { maxLeverageBps: 100_000, feeBps: 250 },
];

describe("resolveProtocolOriginationFeeBps", () => {
  it("picks the first tier whose bound covers the leverage", () => {
    expect(resolveProtocolOriginationFeeBps(referenceTiers, 20_000)).toBe(200);
    expect(resolveProtocolOriginationFeeBps(referenceTiers, 40_000)).toBe(200);
    expect(resolveProtocolOriginationFeeBps(referenceTiers, 50_000)).toBe(225);
    expect(resolveProtocolOriginationFeeBps(referenceTiers, 70_000)).toBe(225);
    expect(resolveProtocolOriginationFeeBps(referenceTiers, 90_000)).toBe(250);
  });

  it("falls back to the last tier as catch-all above every bound", () => {
    expect(resolveProtocolOriginationFeeBps(referenceTiers, 250_000)).toBe(250);
  });

  it("returns 0 for empty tiers", () => {
    expect(resolveProtocolOriginationFeeBps([], 20_000)).toBe(0);
  });
});

describe("resolveOriginationFeeBps", () => {
  it("adds the partner add-on to the protocol tier rate", () => {
    expect(resolveOriginationFeeBps(referenceTiers, 20_000, 25)).toBe(225);
    expect(resolveOriginationFeeBps(referenceTiers, 90_000, 50)).toBe(300);
  });
});

describe("computeOriginationFeeUsdcUnits", () => {
  it("floors notional * bps / 10_000", () => {
    expect(computeOriginationFeeUsdcUnits(50_000_000, 200)).toBe(1_000_000);
    expect(computeOriginationFeeUsdcUnits(5_000_000, 225)).toBe(112_500);
  });
});

describe("expectedPositionTokenUnits", () => {
  it("computes notional / price in token units, floored", () => {
    expect(expectedPositionTokenUnits(50_000_000, 0.51)).toBe(98_039_215);
  });

  it("discounts by slippage", () => {
    expect(expectedPositionTokenUnits(50_000_000, 0.5, 200)).toBe(98_000_000);
  });

  it("returns 0 for a non-positive price", () => {
    expect(expectedPositionTokenUnits(50_000_000, 0)).toBe(0);
  });
});

describe("computePolymarketTradingFee", () => {
  it("is 0 when the fee rate and builder fee are 0", () => {
    expect(computePolymarketTradingFee({ notionalUsdcUnits: 50_000_000, priceUsd: 0.51, feeRateBps: 0 })).toBe(0);
  });

  it("computes the quadratic curvature term for e = 1", () => {
    // C = 100 / 0.5 = 200 contracts; p(1-p) = 0.25; feeRate = 100bps = 0.01
    // fee = 0.01 * 200 * 0.25 * 1e6 = 500_000 USDC units
    expect(computePolymarketTradingFee({ notionalUsdcUnits: 100_000_000, priceUsd: 0.5, feeRateBps: 100 })).toBe(
      500_000,
    );
  });

  it("collapses to flat feeRate * C for e = 0", () => {
    // C = 100 / 0.5 = 200; (p(1-p))^0 = 1; fee = 0.01 * 200 * 1e6 = 2_000_000
    expect(
      computePolymarketTradingFee({
        notionalUsdcUnits: 100_000_000,
        priceUsd: 0.5,
        feeRateBps: 100,
        feeExponent: 0,
      }),
    ).toBe(2_000_000);
  });

  it("adds the flat builder fee on top of the protocol fee", () => {
    // protocol = 500_000 (as above); builder = 50bps of 100_000_000 = 500_000
    expect(
      computePolymarketTradingFee({
        notionalUsdcUnits: 100_000_000,
        priceUsd: 0.5,
        feeRateBps: 100,
        builderTakerFeeRateBps: 50,
      }),
    ).toBe(1_000_000);
  });
});

describe("estimateLiquidationPrice", () => {
  it("is 0 at 1x leverage (no borrowed capital)", () => {
    expect(estimateLiquidationPrice(0.5, 10_000, 250)).toBe(0);
  });

  it("computes the at-entry base liquidation price", () => {
    // L = 2; (L-1)/L = 0.5; loanPerToken = 0.51 * 0.5 = 0.255
    // P_liq = 0.255 * (1 + 250/10000) = 0.255 * 1.025 = 0.261375
    expect(estimateLiquidationPrice(0.51, 20_000, 250)).toBeCloseTo(0.261375, 9);
  });
});

describe("computeMaxGain", () => {
  it("worked example: 2x, $50 notional, entry $0.51, 200 origination bps, 0 trading fee", () => {
    const notionalUsdcUnits = 50_000_000;
    const leverageBps = 20_000;
    const entryPriceUsd = 0.51;

    const positionTokenUnits = expectedPositionTokenUnits(notionalUsdcUnits, entryPriceUsd);
    expect(positionTokenUnits).toBe(98_039_215);

    const combinedBps = resolveOriginationFeeBps(referenceTiers, leverageBps, 0);
    expect(combinedBps).toBe(200);

    const originationFeeUsdcUnits = computeOriginationFeeUsdcUnits(notionalUsdcUnits, combinedBps);
    expect(originationFeeUsdcUnits).toBe(1_000_000);

    const result = computeMaxGain({
      positionTokenUnits,
      notionalUsdcUnits,
      expectedOpenTradingFeeUsdcUnits: 0,
      originationFeeUsdcUnits,
    });

    expect(result.fullValueOnWinUsdcUnits).toBe(98_039_215);
    expect(result.grossMaxGainUsdcUnits).toBe(48_039_215);
    expect(result.netMaxGainUsdcUnits).toBe(47_039_215);
  });

  it("keeps max gain signed (negative) and does not clamp", () => {
    const result = computeMaxGain({
      positionTokenUnits: 40_000_000,
      notionalUsdcUnits: 50_000_000,
      expectedOpenTradingFeeUsdcUnits: 0,
      originationFeeUsdcUnits: 1_000_000,
    });

    expect(result.grossMaxGainUsdcUnits).toBe(-10_000_000);
    expect(result.netMaxGainUsdcUnits).toBe(-11_000_000);
  });
});
