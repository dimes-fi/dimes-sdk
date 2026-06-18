import type { Position, PositionEntry } from "../types/aliases";

const BPS_DIVISOR = 10_000;

/**
 * One leverage-tiered origination-fee rate. `maxLeverageBps` is the inclusive
 * upper bound (in basis points) of leverage covered by this tier; `feeBps` is
 * the protocol origination fee charged for any leverage at or below that bound.
 * Tiers must be supplied in ascending `maxLeverageBps` order; the final tier
 * acts as the catch-all for the highest leverages.
 */
export interface OriginationFeeTier {
  maxLeverageBps: number;
  feeBps: number;
}

/**
 * Resolve the protocol origination fee rate (bps) for a given leverage from an
 * ordered list of leverage tiers. Returns the `feeBps` of the first tier whose
 * `maxLeverageBps >= leverageBps`. If no tier matches (leverage exceeds every
 * bound) the last tier is used as the catch-all. The caller fetches the tiers
 * from the `fee-rates` API; the math is pure.
 *
 * Note: this returns the PROTOCOL rate only — add `partnerOriginationFeeBps`
 * separately (see {@link resolveOriginationFeeBps}).
 */
export function resolveProtocolOriginationFeeBps(tiers: readonly OriginationFeeTier[], leverageBps: number): number {
  const lastTier = tiers[tiers.length - 1];
  if (!lastTier) {
    return 0;
  }
  for (const tier of tiers) {
    if (leverageBps <= tier.maxLeverageBps) {
      return tier.feeBps;
    }
  }
  return lastTier.feeBps;
}

/**
 * Combined origination fee rate (bps) = protocol tier rate + partner add-on.
 * Mirrors the server: the protocol rate is leverage-tiered, the partner rate is
 * a flat add-on supplied by the partner's `fee-rates` config.
 */
export function resolveOriginationFeeBps(
  tiers: readonly OriginationFeeTier[],
  leverageBps: number,
  partnerOriginationFeeBps: number,
): number {
  return resolveProtocolOriginationFeeBps(tiers, leverageBps) + partnerOriginationFeeBps;
}

/**
 * Origination fee in USDC units (1_000_000 = $1), floored, matching the server:
 * `floor(notionalUsdcUnits * combinedOriginationFeeBps / 10_000)`.
 */
export function computeOriginationFeeUsdcUnits(notionalUsdcUnits: number, combinedOriginationFeeBps: number): number {
  return Math.floor((notionalUsdcUnits * combinedOriginationFeeBps) / BPS_DIVISOR);
}

export interface OriginationFeeBreakdown {
  totalBps: number;
  totalUsd: number;
  protocolBps: number;
  protocolUsd: number;
  partnerBps: number;
  partnerUsd: number;
}

function getEntry(position: Position): PositionEntry {
  return position.entry;
}

export function getOriginationFeeBreakdown(position: Position): OriginationFeeBreakdown {
  const entry = getEntry(position);
  const totalBps = entry.originationFeeBps;
  const totalUsd = Number(entry.originationFeeUsd) || 0;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const protocolBps = entry.protocolOriginationFeeBps ?? totalBps;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const partnerBps = entry.partnerOriginationFeeBps ?? 0;

  const share = totalBps > 0 ? protocolBps / totalBps : 1;
  const protocolUsd = totalUsd * share;
  const partnerUsd = totalUsd - protocolUsd;

  return {
    totalBps,
    totalUsd,
    protocolBps,
    protocolUsd,
    partnerBps,
    partnerUsd,
  };
}
