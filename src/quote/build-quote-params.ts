import type { CreateOfferParams } from "../types";
import type { QuoteParams } from "../types/quote";

const DEFAULT_LEVERAGE_STEP_BPS = 2500;

export function buildQuoteParams(params: QuoteParams, stepBps: number = DEFAULT_LEVERAGE_STEP_BPS): CreateOfferParams {
  const leverageBps = Math.round(params.leverageBps / stepBps) * stepBps;
  const notionalUsdPips = Math.round(params.collateralUsd * leverageBps);

  return {
    marketTicker: params.marketTicker,
    effectiveSide: params.side,
    leverageBps,
    notionalAmountUsdPips: notionalUsdPips.toString(),
    slippageBps: params.slippageBps,
  };
}
