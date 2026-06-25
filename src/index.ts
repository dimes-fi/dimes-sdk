export { DimesClient } from "./client";

export type {
  DimesClientOptions,
  GetFeeRatesParams,
  GetMarketsParams,
  GetPositionsParams,
  MarketExpand,
  MarketSort,
  PositionStatus,
  SearchMarketsParams,
} from "./client";

export { ApiKeyAuth, JwtAuth } from "./client";

export type { AuthProvider, ApiKeyAuthOptions, JwtAuthOptions } from "./client";

export { DimesError, DimesApiError, DimesContractError } from "./errors";

export { resolveFriendlyMessage, formatErrorMessage } from "./errors";

export {
  executeQuote,
  isMarketMovedError,
  buildQuoteParams,
  marketMovedCodes,
  quoteErrorHint,
  hintAdjustment,
} from "./quote";

export type { QuoteHint, HintAdjustment, CorrectedField } from "./quote";

export type {
  Market,
  MarketLeverage,
  MarketFees,
  MarketPrices,
  OriginationTier,
  Quote,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- re-export of intentional back-compat alias
  Offer,
  OpenPosition,
  ClosedPosition,
  Position,
  PositionEntry,
  PositionCurrent,
  PositionRisk,
  PositionOpenFees,
  PositionClosedFees,
  PositionResult,
  PositionTiming,
  PositionFailure,
  CloseAttempt,
  PendingOperation,
  PositionUnwind,
  PositionUnwindList,
  ContractInfo,
  CustomerLimit,
  CreateQuoteParams,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- re-export of intentional back-compat alias
  CreateOfferParams,
  CreateTokenResult,
  FeeRates,
  FeeRatesMarket,
  FeeRatesOriginationTier,
  FeeReport,
  FeeReportParams,
  QuoteParams,
  QuoteResult,
  QuoteOptions,
  MarketMovedEvent,
  Side,
  Paginated,
  CamelizeKeys,
} from "./types";

export { isOpenPosition, isClosedPosition, leverageMaxBps } from "./types";

export type { MarketSidedEligibility, MarketMaxLeveragePerNotional, MarketSidedMaxLeveragePerNotional } from "./types";

export {
  getSidedEligibility,
  defaultSide,
  isFullyOpen,
  isFullyClosed,
  rejectionReasonText,
  rejectionReasonShort,
  maxLeverageBpsAtNotional,
  maxViableLeverageBpsForCollateral,
  getOriginationFeeBreakdown,
  resolveProtocolOriginationFeeBps,
  resolveOriginationFeeBps,
  computeOriginationFeeUsdcUnits,
  computeMaxGain,
  estimateLiquidationPrice,
  computePolymarketTradingFee,
  expectedPositionTokenUnits,
  tokenUnitsPerToken,
  partialCloseMinTokens,
  partialCloseMinFractionBps,
  closeTokenUnitsForPct,
  pctBpsForCloseTokenUnits,
  fallbackMinPartialCloseTokenUnits,
  clampCloseTokenUnits,
} from "./utils";

export type {
  SideEligibility,
  SidedEligibility,
  OriginationFeeBreakdown,
  OriginationFeeTier,
  MaxGainInput,
  MaxGainResult,
  PolymarketTradingFeeInput,
} from "./utils";

export type { PositionEvent, PositionEventType } from "./ws/types";

export { positionEventTypes } from "./ws/types";
