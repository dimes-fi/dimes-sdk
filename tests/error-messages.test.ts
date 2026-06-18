import { describe, it, expect } from "vitest";
import { resolveFriendlyMessage, formatErrorMessage } from "../src/errors/error-messages";

describe("resolveFriendlyMessage", () => {
  it("returns static message for known code", () => {
    expect(resolveFriendlyMessage("unauthorized", null)).toBe("Session expired. Please reconnect your wallet.");
  });

  it("returns null for unknown code", () => {
    expect(resolveFriendlyMessage("totally_unknown_code", null)).toBeNull();
  });

  it("formats leverage error with params", () => {
    const msg = resolveFriendlyMessage("quote_leverage_exceeds_maximum", {
      maxLeverageBps: 30000,
      currentLeverageBps: 50000,
    });
    expect(msg).toContain("5");
    expect(msg).toContain("3");
    expect(msg).toContain("above the maximum");
  });

  it("formats position limit with capacity", () => {
    const msg = resolveFriendlyMessage("quote_user_position_limit_exceeded", { availableCapacityUsdPips: "500000000" });
    expect(msg).toContain("Remaining capacity");
    expect(msg).toContain("$");
  });

  it("formats slippage error with both params", () => {
    const msg = resolveFriendlyMessage("quote_slippage_too_high", {
      maxSlippageBps: 200,
      currentSlippageBps: 350,
    });
    expect(msg).toContain("3.5%");
    expect(msg).toContain("2%");
  });

  it("formats min-fill-below-floor error with the floor and notional bound", () => {
    const msg = resolveFriendlyMessage("quote_min_fill_bps_below_floor", {
      boundBy: "notional",
      floorMinFillBps: 5000,
      minFillBps: 3000,
      requestedCollateralUsdPips: "200000",
      requestedNotionalUsdPips: "400000",
    });
    expect(msg).toContain("minimum order size");
    expect(msg).toContain("50%");
  });

  it("formats min-fill-below-floor error with the collateral bound", () => {
    const msg = resolveFriendlyMessage("quote_min_fill_bps_below_floor", {
      boundBy: "collateral",
      floorMinFillBps: 3500,
      minFillBps: 2000,
      requestedCollateralUsdPips: "140000",
      requestedNotionalUsdPips: "1120000",
    });
    expect(msg).toContain("minimum collateral");
    expect(msg).toContain("35%");
  });

  it("tells the user to increase size when the floor exceeds the slider max", () => {
    const msg = resolveFriendlyMessage("quote_min_fill_bps_below_floor", {
      boundBy: "notional",
      floorMinFillBps: 6000,
      minFillBps: 5000,
    });
    expect(msg).toContain("Increase your trade size");
    expect(msg).not.toContain("60%");
  });
});

describe("formatErrorMessage", () => {
  it("returns friendly message for known code", () => {
    expect(formatErrorMessage("quote_market_not_found", null)).toBe("Market not found.");
  });

  it("humanizes unknown codes", () => {
    expect(formatErrorMessage("some_new_error_code", null)).toBe("Some new error code");
  });
});
