import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import { buildRequestPartialCloseTx } from "../src/contract/build-tx";
import {
  clampCloseTokenUnits,
  closeTokenUnitsForPct,
  fallbackMinPartialCloseTokenUnits,
  pctBpsForCloseTokenUnits,
} from "../src/utils/partial-close";

const vaultAddress = getAddress("0x5323fe5a5cd7eccc0ef96761c313e6fab4c324cd");
const positionKey = "0x2222222222222222222222222222222222222222222222222222222222222222" as const;

describe("closeTokenUnitsForPct", () => {
  it("computes a slice from a percentage of the current size", () => {
    expect(closeTokenUnitsForPct(10_000_000n, 5_000)).toBe(5_000_000n);
    expect(closeTokenUnitsForPct(10_000_000n, 2_000)).toBe(2_000_000n);
  });

  it("clamps the percentage to [0, 100]", () => {
    expect(closeTokenUnitsForPct(10_000_000n, -10)).toBe(0n);
    expect(closeTokenUnitsForPct(10_000_000n, 12_000)).toBe(10_000_000n);
  });
});

describe("pctBpsForCloseTokenUnits", () => {
  it("is the inverse of closeTokenUnitsForPct at clean fractions", () => {
    expect(pctBpsForCloseTokenUnits(10_000_000n, 5_000_000n)).toBe(5_000);
  });

  it("returns 0 for an empty position", () => {
    expect(pctBpsForCloseTokenUnits(0n, 1_000_000n)).toBe(0);
  });
});

describe("fallbackMinPartialCloseTokenUnits", () => {
  it("uses 20% of the original size when that exceeds 5 tokens", () => {
    expect(fallbackMinPartialCloseTokenUnits(100_000_000n)).toBe(20_000_000n);
  });

  it("floors at 5 tokens when 20% is smaller", () => {
    expect(fallbackMinPartialCloseTokenUnits(10_000_000n)).toBe(5_000_000n);
  });
});

describe("clampCloseTokenUnits", () => {
  it("clamps to the inclusive bounds", () => {
    expect(clampCloseTokenUnits(1_000_000n, 5_000_000n, 9_000_000n)).toBe(5_000_000n);
    expect(clampCloseTokenUnits(12_000_000n, 5_000_000n, 9_000_000n)).toBe(9_000_000n);
    expect(clampCloseTokenUnits(7_000_000n, 5_000_000n, 9_000_000n)).toBe(7_000_000n);
  });
});

describe("buildRequestPartialCloseTx", () => {
  it("targets the vault and encodes positionKey + closeTokenUnits", () => {
    const tx = buildRequestPartialCloseTx(vaultAddress, positionKey, 5_000_000n);
    expect(tx.address).toBe(vaultAddress);
    expect(tx.functionName).toBe("requestPartialClose");
    expect(tx.args).toEqual([positionKey, 5_000_000n]);
  });
});
