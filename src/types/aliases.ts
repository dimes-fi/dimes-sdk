import type { CamelizeKeys } from "./camelize";
import type { components } from "./generated";

type Raw = components["schemas"];

export type Market = CamelizeKeys<Raw["CustomerMarket"]>;

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

export type Offer = CamelizeKeys<Raw["CustomerOffer"]>;

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

export type PositionUnwind = CamelizeKeys<Raw["CustomerPositionUnwind"]>;

export type PositionUnwindList = CamelizeKeys<Raw["CustomerPositionUnwindList"]>;

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

export interface CreateOfferParams {
  marketTicker: string;
  effectiveSide: "yes" | "no";
  leverageBps: number;
  notionalAmountUsdPips: string;
  slippageBps: number;
  pmProvider?: "polymarket" | "kalshi";
}

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
