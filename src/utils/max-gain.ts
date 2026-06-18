const BPS_DIVISOR = 10_000;
const USDC_UNITS_PER_USD = 1_000_000;
const TOKEN_UNITS_PER_TOKEN = 1_000_000;

/**
 * Inputs to the Polymarket trading-fee curve. All rates are basis points; the
 * caller fetches `feeRateBps`, `feeExponent`, and `builderTakerFeeRateBps` from
 * the `fee-rates` API (snapshotted server-side as `Offer.polymarketFeeRateBps`
 * / `polymarketFeeExponent` / `polymarketBuilderFeeRateBps`).
 */
export interface PolymarketTradingFeeInput {
  notionalUsdcUnits: number;
  priceUsd: number;
  feeRateBps: number;
  feeExponent?: number;
  builderTakerFeeRateBps?: number;
}

/**
 * Polymarket open/close trading fee in USDC units (1_000_000 = $1).
 *
 * Matches the canonical formula (docs: position-math/09-exchange-trading-fees):
 *
 * ```
 * protocol = feeRateBps / 10_000 * C * (p * (1 - p)) ^ feeExponent * 1e6
 * builder  = builderTakerFeeRateBps / 10_000 * notionalUsdc
 * fee      = ceil(protocol + builder)
 * ```
 *
 * where `C` = contracts = notionalUsd / p, `p` = price in dollars (0..1). The
 * curvature term peaks at p = 0.5 and is symmetric; the flat builder term does
 * not shrink at price extremes. `feeExponent` defaults to 1 (standard quadratic
 * curvature); some markets use 0 (flat `feeRate * C`). `builderTakerFeeRateBps`
 * defaults to 0 (Bloom's own operator builder code is always 0-fee).
 */
export function computePolymarketTradingFee(input: PolymarketTradingFeeInput): number {
  const { notionalUsdcUnits, priceUsd, feeRateBps } = input;
  const feeExponent = input.feeExponent ?? 1;
  const builderTakerFeeRateBps = input.builderTakerFeeRateBps ?? 0;

  if (priceUsd <= 0) {
    return 0;
  }

  const notionalUsd = notionalUsdcUnits / USDC_UNITS_PER_USD;
  const contracts = notionalUsd / priceUsd;
  const curvature = (priceUsd * (1 - priceUsd)) ** feeExponent;

  const protocolFeeUsdcUnits = (feeRateBps / BPS_DIVISOR) * contracts * curvature * USDC_UNITS_PER_USD;
  const builderFeeUsdcUnits = (builderTakerFeeRateBps / BPS_DIVISOR) * notionalUsdcUnits;

  return Math.ceil(protocolFeeUsdcUnits + builderFeeUsdcUnits);
}

/**
 * Expected position size in token units (1_000_000 = 1 whole token) for a given
 * notional and entry price, optionally discounted by slippage. A token redeems
 * at $1 on a win, so token units are numerically equal to USDC units.
 *
 * `tokens = notionalUsd / entryPrice`, then scaled down by `slippageBps`.
 * Floored to whole token units. This is an at-quote estimate of the offer's
 * `minExpectedPositionTokenUnits`; the server is authoritative.
 */
export function expectedPositionTokenUnits(notionalUsdcUnits: number, entryPriceUsd: number, slippageBps = 0): number {
  if (entryPriceUsd <= 0) {
    return 0;
  }
  const notionalUsd = notionalUsdcUnits / USDC_UNITS_PER_USD;
  const tokens = notionalUsd / entryPriceUsd;
  const slippageFactor = (BPS_DIVISOR - slippageBps) / BPS_DIVISOR;
  return Math.floor(tokens * slippageFactor * TOKEN_UNITS_PER_TOKEN);
}

/**
 * Estimated base liquidation price (deterministic, at-entry closed form).
 *
 * **This is an estimate, not the server's TWAP solver result.** It computes the
 * at-entry base liquidation price (F = 0, no safety margin) per the docs
 * (position-math/04-liquidation):
 *
 * ```
 * P_liq_base = entryPrice * (L - 1) / L * (1 + liquidationFeeBps / 10_000)
 * ```
 *
 * where `L = leverageBps / 10_000`. At 1x leverage the borrowed capital is zero
 * so the liquidation price is zero. `entryPriceUsd` is in dollars; the result is
 * in the same units. The live server liquidation price drifts above this as the
 * lifetime fee `F` accrues and includes a safety margin.
 */
export function estimateLiquidationPrice(
  entryPriceUsd: number,
  leverageBps: number,
  liquidationFeeBps: number,
): number {
  const leverage = leverageBps / BPS_DIVISOR;
  if (leverage <= 1) {
    return 0;
  }
  const loanPerToken = entryPriceUsd * ((leverage - 1) / leverage);
  return loanPerToken * (1 + liquidationFeeBps / BPS_DIVISOR);
}

/**
 * Inputs for {@link computeMaxGain}. All amounts are in USDC units
 * (1_000_000 = $1) except `positionTokenUnits` (token units, 1_000_000 = 1
 * token) which is numerically equal to its settlement USDC value.
 */
export interface MaxGainInput {
  positionTokenUnits: number;
  notionalUsdcUnits: number;
  expectedOpenTradingFeeUsdcUnits: number;
  originationFeeUsdcUnits: number;
}

/**
 * Result of {@link computeMaxGain}. All amounts in USDC units (1_000_000 = $1).
 * Gains are profit OVER principal (notional = loan + collateral) and may be
 * negative — they are signed and never clamped.
 */
export interface MaxGainResult {
  fullValueOnWinUsdcUnits: number;
  grossMaxGainUsdcUnits: number;
  netMaxGainUsdcUnits: number;
}

/**
 * Maximum gain (gross and net) for a winning settlement exit — profit over
 * principal. On a win each position token redeems at $1 (CTF settlement), so
 * the full value equals `positionTokenUnits` and there is NO exit trading fee.
 *
 * ```
 * fullValueOnWin = positionTokenUnits
 * grossMaxGain   = fullValueOnWin - notionalUsdcUnits
 * netMaxGain     = grossMaxGain - expectedOpenTradingFee - originationFee
 * ```
 *
 * Lifetime fees are excluded, so net max gain is an upper bound (a position held
 * to settlement accrues lifetime fees that reduce realized profit). Gains are
 * signed — a position whose principal exceeds its winning redemption value
 * yields a negative max gain.
 */
export function computeMaxGain(input: MaxGainInput): MaxGainResult {
  const fullValueOnWinUsdcUnits = input.positionTokenUnits;
  const grossMaxGainUsdcUnits = fullValueOnWinUsdcUnits - input.notionalUsdcUnits;
  const netMaxGainUsdcUnits =
    grossMaxGainUsdcUnits - input.expectedOpenTradingFeeUsdcUnits - input.originationFeeUsdcUnits;

  return {
    fullValueOnWinUsdcUnits,
    grossMaxGainUsdcUnits,
    netMaxGainUsdcUnits,
  };
}
