import { describe, it, expect } from "vitest";
import {
  isOpenPosition,
  isClosedPosition,
  leverageMaxBps,
  type Position,
  type MarketLeverage,
} from "../src/types/aliases";

describe("isOpenPosition", () => {
  it("returns true for object with 'current' property", () => {
    const p = { current: { some: "data" } } as unknown as Position;
    expect(isOpenPosition(p)).toBe(true);
  });

  it("returns false for object with 'result' property", () => {
    const p = { result: { some: "data" } } as unknown as Position;
    expect(isOpenPosition(p)).toBe(false);
  });
});

describe("isClosedPosition", () => {
  it("returns true for object with 'result' property", () => {
    const p = { result: { some: "data" } } as unknown as Position;
    expect(isClosedPosition(p)).toBe(true);
  });

  it("returns false for object with 'current' property", () => {
    const p = { current: { some: "data" } } as unknown as Position;
    expect(isClosedPosition(p)).toBe(false);
  });
});

describe("leverageMaxBps", () => {
  it("returns perSide value for 'yes' when maxYesBps is set", () => {
    const lev = { maxYesBps: 5000, maxNoBps: 3000, maxBps: 4000, minBps: 1000 } as MarketLeverage;
    expect(leverageMaxBps(lev, "yes")).toBe(5000);
  });

  it("returns perSide value for 'no' when maxNoBps is set", () => {
    const lev = { maxYesBps: 5000, maxNoBps: 3000, maxBps: 4000, minBps: 1000 } as MarketLeverage;
    expect(leverageMaxBps(lev, "no")).toBe(3000);
  });

  it("falls back to maxBps when per-side is null", () => {
    const lev = { maxYesBps: null, maxNoBps: null, maxBps: 4000, minBps: 1000 } as unknown as MarketLeverage;
    expect(leverageMaxBps(lev, "yes")).toBe(4000);
    expect(leverageMaxBps(lev, "no")).toBe(4000);
  });

  it("falls back to minBps when maxBps is also null", () => {
    const lev = { maxYesBps: null, maxNoBps: null, maxBps: null, minBps: 1000 } as unknown as MarketLeverage;
    expect(leverageMaxBps(lev, "yes")).toBe(1000);
    expect(leverageMaxBps(lev, "no")).toBe(1000);
  });
});
