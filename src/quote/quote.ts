import { DimesApiError, DimesError } from "../errors/dimes-error";
import type { CreateQuoteParams, Quote } from "../types";
import type { QuoteOptions, QuoteParams, QuoteResult } from "../types/quote";
import { buildQuoteParams } from "./build-quote-params";
import { type HintAdjustment, hintAdjustment, marketMovedCodes, quoteErrorHint } from "./quote-error-hints";

export interface QuoteClient {
  createDraftQuote(params: CreateQuoteParams): Promise<Quote>;
  promoteDraftQuote(draftId: string): Promise<Quote>;
  createQuote(params: CreateQuoteParams): Promise<Quote>;
}

const DEFAULT_MAX_RETRIES = 3;

export function isMarketMovedError(err: unknown): boolean {
  return err instanceof DimesApiError && marketMovedCodes.has(err.code);
}

function applyAdjustment(
  params: CreateQuoteParams,
  adj: NonNullable<HintAdjustment>,
  currentParams: QuoteParams,
): CreateQuoteParams {
  switch (adj.field) {
    case "collateral": {
      const notionalUsdPips = Math.round(adj.toValue * params.leverageBps);
      return { ...params, notionalAmountUsdPips: notionalUsdPips.toString() };
    }
    case "leverage": {
      const notionalUsdPips = Math.round(currentParams.collateralUsd * adj.toValue);
      return {
        ...params,
        leverageBps: adj.toValue,
        notionalAmountUsdPips: notionalUsdPips.toString(),
      };
    }
    case "slippage":
      return { ...params, slippageBps: adj.toValue };
    case "minFill":
      return { ...params, allowPartialFill: true, minFillBps: adj.toValue };
    default:
      return params;
  }
}

function handleMarketMoved(err: unknown, attempt: number, maxRetries: number): boolean {
  return isMarketMovedError(err) && attempt < maxRetries;
}

function handleCorrection(err: unknown, currentParams: QuoteParams): { adj: NonNullable<HintAdjustment> } | null {
  if (!(err instanceof DimesApiError)) {
    return null;
  }

  const hint = quoteErrorHint(err.code, err.params, {
    leverageBps: currentParams.leverageBps,
  });

  const adj = hintAdjustment(hint, {
    collateralUsd: currentParams.collateralUsd,
    leverageBps: currentParams.leverageBps,
    slippageBps: currentParams.slippageBps,
    minFillBps: currentParams.minFillBps,
  });

  if (!adj) {
    return null;
  }

  return { adj };
}

// eslint-disable-next-line complexity
export async function executeQuote(
  client: QuoteClient,
  params: QuoteParams,
  options?: QuoteOptions,
): Promise<QuoteResult> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const autoCorrect = options?.autoCorrect ?? true;
  const corrections: NonNullable<HintAdjustment>[] = [];
  let retries = 0;

  let quoteParams = buildQuoteParams(params);
  const currentParams = { ...params };

  const draft = await client.createDraftQuote(quoteParams);
  options?.onDraftReady?.(draft);

  let currentDraft: Quote = draft;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const promotedQuote = await client.promoteDraftQuote(currentDraft.id);
      return { quote: promotedQuote, offer: promotedQuote, corrections, retries };
    } catch (err) {
      if (handleMarketMoved(err, attempt, maxRetries)) {
        const newDraft = await client.createDraftQuote(quoteParams);
        retries++;

        const callbackResult = options?.onMarketMoved?.({
          originalDraft: currentDraft,
          newDraft,
          retryCount: retries,
        });

        if (callbackResult === false) {
          throw err;
        }

        currentDraft = newDraft;
        continue;
      }

      if (autoCorrect) {
        const correction = handleCorrection(err, currentParams);

        if (correction) {
          const callbackResult = options?.onCorrection?.(correction.adj);
          if (callbackResult === false) {
            throw err;
          }

          quoteParams = applyAdjustment(quoteParams, correction.adj, currentParams);
          corrections.push(correction.adj);

          const correctedQuote = await client.createQuote(quoteParams);
          return { quote: correctedQuote, offer: correctedQuote, corrections, retries };
        }
      }

      throw err;
    }
  }

  throw new DimesError("market_moved_retries_exhausted", "Exhausted market-moved retries");
}
