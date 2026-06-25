const BPS_DIVISOR = 10_000;
const BPS_DIVISOR_BIG = 10_000n;

export const tokenUnitsPerToken = 1_000_000n;

export const partialCloseMinTokens = 5n;

export const partialCloseMinFractionBps = 2_000n;

export function closeTokenUnitsForPct(currentTokenUnits: bigint, pctBps: number): bigint {
  const clampedBps = BigInt(Math.max(0, Math.min(BPS_DIVISOR, Math.round(pctBps))));

  return (currentTokenUnits * clampedBps) / BPS_DIVISOR_BIG;
}

export function pctBpsForCloseTokenUnits(currentTokenUnits: bigint, closeTokenUnits: bigint): number {
  if (currentTokenUnits <= 0n) {
    return 0;
  }

  return Number((closeTokenUnits * BPS_DIVISOR_BIG) / currentTokenUnits);
}

export function fallbackMinPartialCloseTokenUnits(originalTokenUnits: bigint): bigint {
  const floorTokens = partialCloseMinTokens * tokenUnitsPerToken;
  const floorFraction = (originalTokenUnits * partialCloseMinFractionBps) / BPS_DIVISOR_BIG;

  return floorFraction > floorTokens ? floorFraction : floorTokens;
}

export function clampCloseTokenUnits(value: bigint, min: bigint, max: bigint): bigint {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}
