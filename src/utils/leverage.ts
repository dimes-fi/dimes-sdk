import { type Market, type MarketMaxLeveragePerNotional, leverageMaxBps } from "../types/aliases";
import type { Side } from "./eligibility";

const USD_100 = 100;
const USD_500 = 500;
const USD_1K = 1_000;
const USD_10K = 10_000;
const BPS_PER_UNIT = 10_000;

const ANCHORS_USD = [USD_100, USD_500, USD_1K, USD_10K] as const;

type Anchor = readonly [usd: number, bps: number];

function anchorsForSide(market: Market, side: Side): readonly Anchor[] {
  const sided = market.leverage.maxMarketLeveragePerNotional;
  const per: MarketMaxLeveragePerNotional = side === "yes" ? sided.yes : sided.no;
  return [
    [ANCHORS_USD[0], per.at100UsdBps],
    [ANCHORS_USD[1], per.at500UsdBps],
    [ANCHORS_USD[2], per.at1000UsdBps],
    [ANCHORS_USD[3], per.at10000UsdBps],
  ];
}

function snapDownToStep(bps: number, stepBps: number, minBps: number): number {
  if (stepBps <= 0) {
    return Math.max(minBps, bps);
  }
  const k = Math.floor((bps - minBps) / stepBps);
  return Math.max(minBps, minBps + Math.max(0, k) * stepBps);
}

function interpolateRawBps(anchors: readonly Anchor[], notionalUsd: number): number {
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (!first || !last) {
    return 0;
  }
  if (notionalUsd <= first[0]) {
    return first[1];
  }
  if (notionalUsd >= last[0]) {
    return last[1];
  }
  for (let i = 1; i < anchors.length; i++) {
    const hi = anchors[i];
    const lo = anchors[i - 1];
    if (!hi || !lo) {
      continue;
    }
    if (notionalUsd <= hi[0]) {
      const t = (notionalUsd - lo[0]) / (hi[0] - lo[0]);
      return lo[1] + (hi[1] - lo[1]) * t;
    }
  }
  return last[1];
}

/**
 * Maximum leverage in basis points the API will allow at a given notional, per side.
 * Piecewise-linear interpolation across the four anchor points ($100/$500/$1k/$10k).
 * Below $100 uses the $100 cap; above $10k uses the $10k cap. Result is clamped to
 * the absolute side max and rounded down to `stepBps`.
 */
export function maxLeverageBpsAtNotional(market: Market, side: Side, notionalUsd: number): number {
  const sideAbsMax = leverageMaxBps(market.leverage, side);
  if (!Number.isFinite(notionalUsd) || notionalUsd <= 0) {
    return sideAbsMax;
  }
  const anchors = anchorsForSide(market, side);
  const raw = interpolateRawBps(anchors, notionalUsd);
  const clamped = Math.min(sideAbsMax, raw);
  return snapDownToStep(clamped, market.leverage.stepBps, market.leverage.minBps);
}

/**
 * Largest leverage (bps) the user can pick for a given collateral such that the
 * resulting notional still satisfies the per-notional cap.
 *
 * Walks down from the absolute side max in `stepBps` increments and returns the
 * first leverage `lev` where `lev <= maxLeverageBpsAtNotional(collateral * lev / 1)`.
 */
export function maxViableLeverageBpsForCollateral(market: Market, side: Side, collateralUsd: number): number {
  const sideAbsMax = leverageMaxBps(market.leverage, side);
  if (!Number.isFinite(collateralUsd) || collateralUsd <= 0) {
    return sideAbsMax;
  }

  const step = Math.max(market.leverage.stepBps, 1);
  const minBps = market.leverage.minBps;
  const maxSteps = Math.max(0, Math.floor((sideAbsMax - minBps) / step));

  for (let i = maxSteps; i >= 0; i--) {
    const lev = minBps + i * step;
    const notionalUsd = collateralUsd * (lev / BPS_PER_UNIT);
    if (lev <= maxLeverageBpsAtNotional(market, side, notionalUsd)) {
      return lev;
    }
  }
  return minBps;
}
