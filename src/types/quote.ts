import type { HintAdjustment } from "../quote/quote-error-hints";
import type { Quote } from "./aliases";

export type Side = "yes" | "no";

export interface QuoteParams {
  marketTicker: string;
  side: Side;
  collateralUsd: number;
  leverageBps: number;
  slippageBps: number;
  /**
   * Allow the order to fill less than the requested notional (down to `minFillBps`),
   * opening the position at the actual fill size. Defaults to atomic (fully filled or rejected).
   */
  allowPartialFill?: boolean;
  /** Minimum acceptable fill in basis points. Only valid when `allowPartialFill` is true. */
  minFillBps?: number;
}

export interface MarketMovedEvent {
  originalDraft: Quote;
  newDraft: Quote;
  retryCount: number;
}

export interface QuoteOptions {
  maxRetries?: number;
  autoCorrect?: boolean;
  onDraftReady?: (draft: Quote) => void;
  onMarketMoved?: (event: MarketMovedEvent) => boolean | undefined;
  onCorrection?: (adjustment: HintAdjustment) => boolean | undefined;
}

export interface QuoteResult {
  quote: Quote;
  /** @deprecated Renamed to {@link QuoteResult.quote}. Still populated for backward compatibility. */
  // eslint-disable-next-line no-restricted-syntax -- intentional deprecated alias field
  offer: Quote;
  corrections: HintAdjustment[];
  retries: number;
}
