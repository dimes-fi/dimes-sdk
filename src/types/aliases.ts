import type { CamelizeKeys } from "./camelize";
import type { components } from "./generated";

type Raw = components["schemas"];

/**
 * The event a market belongs to — the real-world happening it resolves against (one game, one
 * hourly price window). `seriesTicker` names the recurring template the event came from, and is
 * null for events with no series.
 *
 * Hand-written rather than derived from `Raw` because `generated.ts` is currently pinned to an API
 * version that predates this block. Delete this and let `CustomerMarket` supply `event` the next
 * time the types are regenerated against a spec that has it.
 */
export interface MarketEvent {
  seriesTicker: string | null;
  ticker: string;
  title: string | null;
}

export type Market = CamelizeKeys<Raw["CustomerMarket"]> & { event: MarketEvent };

export type MarketLeverage = CamelizeKeys<Raw["CustomerLeverage"]>;

export type MarketMaxLeveragePerNotional = CamelizeKeys<Raw["CustomerMaxMarketLeveragePerNotional"]>;

export type MarketSidedMaxLeveragePerNotional = CamelizeKeys<Raw["CustomerSidedMaxMarketLeveragePerNotional"]>;

export type MarketSidedEligibility = CamelizeKeys<Raw["CustomerSidedEligibility"]>;

export type MarketFees = CamelizeKeys<Raw["CustomerFees"]>;

export type MarketPrices = CamelizeKeys<Raw["CustomerMarketPrices"]>;

export interface MarketPolymarket {
  conditionId: string | null;
  noTokenId: string;
  slug: string;
  yesTokenId: string;
}

export type OriginationTier = CamelizeKeys<Raw["CustomerOriginationTier"]>;

export type Quote = CamelizeKeys<Raw["CustomerOffer"]>;

/** @deprecated Use {@link Quote}. Back-compat alias; removed in a future major. */
// eslint-disable-next-line no-restricted-syntax -- intentional deprecated alias
export type Offer = Quote;

export type OpenPosition = CamelizeKeys<Raw["CustomerOpenPosition"]>;

export type ClosedPosition = CamelizeKeys<Raw["CustomerClosedPosition"]>;

export type Position = OpenPosition | ClosedPosition;

export type PositionEntry = CamelizeKeys<Raw["CustomerPositionEntry"]>;

export type PositionCurrent = CamelizeKeys<Raw["CustomerPositionCurrent"]>;

export type PositionRisk = CamelizeKeys<Raw["CustomerPositionRisk"]>;

export type PositionOpenFees = CamelizeKeys<Raw["CustomerPositionOpenFees"]>;

export type PositionClosedFees = CamelizeKeys<Raw["CustomerPositionClosedFees"]>;

export type PositionResult = CamelizeKeys<Raw["CustomerPositionResult"]>;

export type PositionTiming = CamelizeKeys<Raw["CustomerPositionTiming"]>;

export type PositionFailure = CamelizeKeys<Raw["CustomerPositionFailure"]>;

export type CloseAttempt = CamelizeKeys<Raw["CustomerCloseAttempt"]>;

export type PendingOperation = CamelizeKeys<Raw["CustomerPendingOperation"]>;

export type PositionUnwind = CamelizeKeys<Raw["CustomerPositionUnwind"]>;

export type PositionUnwindList = CamelizeKeys<Raw["CustomerPositionUnwindList"]>;

export type PositionPartialClose = CamelizeKeys<Raw["CustomerPartialClose"]>;

export type PositionPartialCloseList = CamelizeKeys<Raw["CustomerPartialCloseList"]>;

export type PositionTransactionEntry = CamelizeKeys<Raw["PositionTransactionEntry"]>;

export type PositionTransactionGroup = CamelizeKeys<Raw["PositionTransactionGroup"]>;

export type PositionTransactions = CamelizeKeys<Raw["PositionTransactions"]>;

export type ContractInfo = CamelizeKeys<Raw["CustomerContractInfo"]>;

export type CustomerLimit = CamelizeKeys<Raw["CustomerLimit"]>;

export type CreateTokenResult = CamelizeKeys<Raw["CreateTokenResult"]>;

export type FeeRatesOriginationTier = CamelizeKeys<Raw["CustomerOriginationFeeTier"]>;

export type FeeRatesMarket = CamelizeKeys<Raw["CustomerFeeRatesMarket"]>;

export type FeeRates = CamelizeKeys<Raw["CustomerFeeRates"]>;

export type FeeReport = CamelizeKeys<Raw["CustomerFeeReport"]>;

export type RiskMode = "adaptive" | "committed";

export interface CreateQuoteParams {
  marketTicker: string;
  effectiveSide: "yes" | "no";
  leverageBps: number;
  notionalAmountUsdPips: string;
  slippageBps: number;
  pmProvider?: "polymarket" | "kalshi";
  allowPartialFill?: boolean;
  minFillBps?: number;
  /**
   * Ask for a committed deleverage plan (a fixed ladder of trigger prices, backed by a refundable
   * margin deposit) instead of the adaptive risk engine. Defaults to `adaptive`.
   *
   * A committed request is answered in committed mode or rejected with
   * `quote_committed_risk_mode_unavailable` — you never get an adaptive quote back from it. Take a
   * draft first and read `committedUnwinds.available` to know whether the mode is on offer.
   */
  riskMode?: RiskMode;
}

/** @deprecated Renamed to {@link CreateQuoteParams}. Kept as an alias for backward compatibility. */
// eslint-disable-next-line no-restricted-syntax -- intentional deprecated alias
export type CreateOfferParams = CreateQuoteParams;

export interface FeeReportParams {
  marketTicker: string;
  effectiveSide: "yes" | "no";
  leverageBps: number;
  notionalAmountUsdPips: string;
  entryPriceUsdPips?: string;
}

export function isOpenPosition(p: Position): p is OpenPosition {
  return "current" in p;
}

export function isClosedPosition(p: Position): p is ClosedPosition {
  return "result" in p;
}

export function leverageMaxBps(lev: MarketLeverage, side: "yes" | "no"): number {
  const perSide = side === "yes" ? lev.maxYesBps : lev.maxNoBps;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return perSide ?? lev.maxBps ?? lev.minBps;
}
