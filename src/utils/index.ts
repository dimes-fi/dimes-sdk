export { asNumber, asBigInt, getParam } from "./parse";

export type { Params } from "./parse";

export { formatLeverage, formatBpsPct, formatFractionPct, formatPipsUsd } from "./format";

export {
  getSidedEligibility,
  defaultSide,
  isFullyOpen,
  isFullyClosed,
  rejectionReasonText,
  rejectionReasonShort,
} from "./eligibility";

export type { Side, SideEligibility, SidedEligibility } from "./eligibility";

export { maxLeverageBpsAtNotional, maxViableLeverageBpsForCollateral } from "./leverage";

export {
  getOriginationFeeBreakdown,
  resolveProtocolOriginationFeeBps,
  resolveOriginationFeeBps,
  computeOriginationFeeUsdcUnits,
} from "./fees";

export type { OriginationFeeBreakdown, OriginationFeeTier } from "./fees";

export {
  computeMaxGain,
  estimateLiquidationPrice,
  computePolymarketTradingFee,
  expectedPositionTokenUnits,
} from "./max-gain";

export type { MaxGainInput, MaxGainResult, PolymarketTradingFeeInput } from "./max-gain";

export {
  tokenUnitsPerToken,
  partialCloseMinTokens,
  partialCloseMinFractionBps,
  closeTokenUnitsForPct,
  pctBpsForCloseTokenUnits,
  fallbackMinPartialCloseTokenUnits,
  clampCloseTokenUnits,
} from "./partial-close";
