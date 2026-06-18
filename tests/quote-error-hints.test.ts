import { describe, it, expect } from "vitest";
import { quoteErrorHint, hintAdjustment } from "../src/quote/quote-error-hints";

describe("quoteErrorHint", () => {
  it("returns null for unknown code", () => {
    expect(quoteErrorHint("unknown_code", null, { leverageBps: 20000 })).toBeNull();
  });

  it("returns clamp-leverage for exceeds maximum", () => {
    const hint = quoteErrorHint("quote_leverage_exceeds_maximum", { maxLeverageBps: 30000 }, { leverageBps: 50000 });
    expect(hint).toEqual({ kind: "clamp-leverage", maxLeverageBps: 30000 });
  });

  it("returns raise-collateral for collateral floor breach", () => {
    const hint = quoteErrorHint(
      "quote_leverage_exceeds_collateral_floor",
      {
        currentBookLeverageBps: 40000,
        currentCollateralUsdPips: 180000,
        maxLeverageBps: 35000,
        minCollateralUsdPips: 200000,
      },
      { leverageBps: 40000 },
    );
    expect(hint).toEqual({ kind: "raise-collateral", minCollateralUsd: 20 });
  });

  it("returns null for collateral floor without minCollateralUsdPips", () => {
    const hint = quoteErrorHint("quote_leverage_exceeds_collateral_floor", {}, { leverageBps: 40000 });
    expect(hint).toBeNull();
  });

  it("returns raise-leverage for below minimum", () => {
    const hint = quoteErrorHint("quote_leverage_below_minimum", { minLeverageBps: 10000 }, { leverageBps: 5000 });
    expect(hint).toEqual({ kind: "raise-leverage", minLeverageBps: 10000 });
  });

  it("returns raise-slippage hint", () => {
    const hint = quoteErrorHint(
      "quote_slippage_too_high",
      { currentSlippageBps: 350, maxSlippageBps: 200 },
      { leverageBps: 20000 },
    );
    expect(hint).toEqual({
      kind: "raise-slippage",
      currentSlippageBps: 350,
      maxSlippageBps: 200,
    });
  });

  it("returns use-max-collateral for capacity exceeded", () => {
    const hint = quoteErrorHint(
      "quote_side_capacity_exceeded",
      {
        maxSupportedCollateralUsdPips: 1000000,
        minNotionalUsdPips: 100000,
        availableCapacityUsdPips: 5000000,
      },
      { leverageBps: 20000 },
    );
    expect(hint?.kind).toBe("use-max-collateral");
  });

  it("returns market-full when max < min", () => {
    const hint = quoteErrorHint(
      "quote_side_capacity_exceeded",
      {
        maxSupportedCollateralUsdPips: 1000,
        minNotionalUsdPips: 10000000,
        availableCapacityUsdPips: 500,
      },
      { leverageBps: 20000 },
    );
    expect(hint?.kind).toBe("market-full");
  });

  it("returns insufficient-liquidity (not market-full) for a structurally thin book", () => {
    const hint = quoteErrorHint(
      "notional_selector_insufficient_liquidity",
      {
        maxSupportedCollateralUsdPips: 53436,
        minNotionalUsdPips: 300000,
        slippageMaxUsdPips: 80155,
      },
      { leverageBps: 15000 },
    );
    expect(hint).toEqual({ kind: "insufficient-liquidity", maxCollateralUsd: 5.3436, minCollateralUsd: 20 });
  });

  it("returns use-max-collateral for notional_selector_insufficient_liquidity when max >= min", () => {
    const hint = quoteErrorHint(
      "notional_selector_insufficient_liquidity",
      {
        maxSupportedCollateralUsdPips: 500000,
        minNotionalUsdPips: 100000,
        slippageMaxUsdPips: 2000000,
      },
      { leverageBps: 20000 },
    );
    expect(hint).toEqual({ kind: "use-max-collateral", maxCollateralUsd: 50, minCollateralUsd: 5 });
  });
});

describe("quoteErrorHint min-fill", () => {
  it("returns raise-min-fill at the floor when below the slider max", () => {
    const hint = quoteErrorHint("quote_min_fill_bps_below_floor", { floorMinFillBps: 5000 }, { leverageBps: 20000 });
    expect(hint).toEqual({ kind: "raise-min-fill", minFillBps: 5000 });
  });

  it("returns null when the floor exceeds the slider max (no fill % can satisfy it)", () => {
    const hint = quoteErrorHint("quote_min_fill_bps_below_floor", { floorMinFillBps: 6000 }, { leverageBps: 20000 });
    expect(hint).toBeNull();
  });
});

describe("hintAdjustment", () => {
  it("returns minFill adjustment for raise-min-fill", () => {
    const adj = hintAdjustment(
      { kind: "raise-min-fill", minFillBps: 5000 },
      { collateralUsd: 100, leverageBps: 20000, slippageBps: 200, minFillBps: 3000 },
    );
    expect(adj).toEqual({
      field: "minFill",
      fromValue: 3000,
      toValue: 5000,
      toLabel: "50%",
      reason: "raise-min-fill",
    });
  });

  it("returns null for null hint", () => {
    expect(hintAdjustment(null, { collateralUsd: 100, leverageBps: 20000, slippageBps: 200 })).toBeNull();
  });

  it("returns null for market-full", () => {
    expect(
      hintAdjustment({ kind: "market-full" }, { collateralUsd: 100, leverageBps: 20000, slippageBps: 200 }),
    ).toBeNull();
  });

  it("returns null for insufficient-liquidity", () => {
    expect(
      hintAdjustment(
        { kind: "insufficient-liquidity", maxCollateralUsd: 5.34, minCollateralUsd: 20 },
        { collateralUsd: 100, leverageBps: 20000, slippageBps: 200 },
      ),
    ).toBeNull();
  });

  it("returns leverage adjustment for clamp-leverage", () => {
    const adj = hintAdjustment(
      { kind: "clamp-leverage", maxLeverageBps: 30000 },
      { collateralUsd: 100, leverageBps: 50000, slippageBps: 200 },
    );
    expect(adj).toEqual({
      field: "leverage",
      fromValue: 50000,
      toValue: 30000,
      toLabel: "3x",
      reason: "clamp-max",
    });
  });

  it("returns collateral adjustment for raise-collateral (ceiling rounded)", () => {
    const adj = hintAdjustment(
      { kind: "raise-collateral", minCollateralUsd: 20 },
      { collateralUsd: 18, leverageBps: 40000, slippageBps: 200 },
    );
    expect(adj).toEqual({
      field: "collateral",
      fromValue: 18,
      toValue: 20,
      toLabel: "$20.00",
      reason: "min-collateral",
    });
  });

  it("returns collateral adjustment for use-max-collateral", () => {
    const adj = hintAdjustment(
      { kind: "use-max-collateral", maxCollateralUsd: 75.5, minCollateralUsd: 1 },
      { collateralUsd: 100, leverageBps: 20000, slippageBps: 200 },
    );
    expect(adj?.field).toBe("collateral");
    expect(adj?.toValue).toBe(75.5);
  });

  it("returns slippage adjustment for raise-slippage", () => {
    const adj = hintAdjustment(
      { kind: "raise-slippage", currentSlippageBps: 350, maxSlippageBps: 200 },
      { collateralUsd: 100, leverageBps: 20000, slippageBps: 100 },
    );
    expect(adj).toEqual({
      field: "slippage",
      fromValue: 350,
      toValue: 200,
      toLabel: "2%",
      reason: "raise-slippage",
    });
  });
});
