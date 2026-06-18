import { DimesApiError, DimesError } from "../errors/dimes-error";
import type { CreateOfferParams, Offer } from "../types";
import type { QuoteOptions, QuoteParams, QuoteResult } from "../types/quote";
import { buildQuoteParams } from "./build-quote-params";
import { type HintAdjustment, hintAdjustment, marketMovedCodes, quoteErrorHint } from "./quote-error-hints";

export interface QuoteClient {
  createDraftQuote(params: CreateOfferParams): Promise<Offer>;
  promoteDraftQuote(draftId: string): Promise<Offer>;
  createQuote(params: CreateOfferParams): Promise<Offer>;
}

const DEFAULT_MAX_RETRIES = 3;

function isMarketMovedError(err: unknown): boolean {
  return err instanceof DimesApiError && marketMovedCodes.has(err.code);
}

function applyAdjustment(
  params: CreateOfferParams,
  adj: NonNullable<HintAdjustment>,
  currentParams: QuoteParams,
): CreateOfferParams {
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

  let offerParams = buildQuoteParams(params);
  const currentParams = { ...params };

  const draft = await client.createDraftQuote(offerParams);
  options?.onDraftReady?.(draft);

  let currentDraft: Offer = draft;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const promotedOffer = await client.promoteDraftQuote(currentDraft.id);
      return { offer: promotedOffer, corrections, retries };
    } catch (err) {
      if (handleMarketMoved(err, attempt, maxRetries)) {
        const newDraft = await client.createDraftQuote(offerParams);
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

          offerParams = applyAdjustment(offerParams, correction.adj, currentParams);
          corrections.push(correction.adj);

          const correctedOffer = await client.createQuote(offerParams);
          return { offer: correctedOffer, corrections, retries };
        }
      }

      throw err;
    }
  }

  throw new DimesError("market_moved_retries_exhausted", "Exhausted market-moved retries");
}
