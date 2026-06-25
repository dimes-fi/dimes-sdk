export type { CamelizeKeys } from "./camelize";

export { isOpenPosition, isClosedPosition, leverageMaxBps } from "./aliases";

export type {
  Market,
  MarketLeverage,
  MarketFees,
  MarketPrices,
  MarketPolymarket,
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
  PositionTransactionEntry,
  PositionTransactionGroup,
  PositionTransactions,
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
  MarketSidedEligibility,
  MarketMaxLeveragePerNotional,
  MarketSidedMaxLeveragePerNotional,
} from "./aliases";

export type { QuoteParams, QuoteResult, QuoteOptions, MarketMovedEvent, Side } from "./quote";

export type { Paginated } from "./common";
