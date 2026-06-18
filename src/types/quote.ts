import type { HintAdjustment } from "../quote/quote-error-hints";
import type { Offer } from "./aliases";

export type Side = "yes" | "no";

export interface QuoteParams {
  marketTicker: string;
  side: Side;
  collateralUsd: number;
  leverageBps: number;
  slippageBps: number;
}

export interface MarketMovedEvent {
  originalDraft: Offer;
  newDraft: Offer;
  retryCount: number;
}

export interface QuoteOptions {
  maxRetries?: number;
  autoCorrect?: boolean;
  onDraftReady?: (draft: Offer) => void;
  onMarketMoved?: (event: MarketMovedEvent) => boolean | undefined;
  onCorrection?: (adjustment: HintAdjustment) => boolean | undefined;
}

export interface QuoteResult {
  offer: Offer;
  corrections: HintAdjustment[];
  retries: number;
}
