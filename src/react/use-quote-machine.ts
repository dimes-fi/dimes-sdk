import { useCallback, useReducer, useRef } from "react";
import { buildQuoteParams } from "../quote/build-quote-params";
import { isMarketMovedError } from "../quote/quote";
import type { CreateQuoteParams, Quote, RiskMode } from "../types";
import type { QuoteParams } from "../types/quote";
import { useDimesClient } from "./provider";

const DEFAULT_MAX_RETRIES = 3;

/**
 * Interactive, user-in-the-loop quote flow: draft → review → promote, pausing
 * across renders so the UI can show each step. This is the granular companion
 * to `useQuote`/`executeQuote` (which run draft→promote in one call). The steps
 * map directly onto the SDK client (`createDraftQuote`/`promoteDraftQuote`/
 * `createQuote`); on a market-moved promote failure it re-drafts and surfaces a
 * `market-moved` state so the user can review and accept the new draft.
 */
export type QuoteMachineState =
  | { phase: "idle" }
  | { phase: "loading-draft" }
  | { phase: "draft-ready"; draft: Quote; quotedAt: number }
  | { phase: "promoting"; draft: Quote; quotedAt: number }
  | { phase: "promoted"; draft: Quote; promotedQuote: Quote; correctedFrom?: Quote; quotedAt: number }
  | { phase: "market-moved"; originalDraft: Quote; newDraft: Quote; retryCount: number; quotedAt: number }
  | { phase: "error"; error: unknown; draft?: Quote };

type Action =
  | { type: "loading" }
  | { type: "draftReady"; draft: Quote; quotedAt: number }
  | { type: "promoting"; draft: Quote; quotedAt: number }
  | { type: "promoted"; draft: Quote; promotedQuote: Quote; correctedFrom?: Quote; quotedAt: number }
  | { type: "marketMoved"; originalDraft: Quote; newDraft: Quote; retryCount: number; quotedAt: number }
  | { type: "error"; error: unknown; draft?: Quote }
  | { type: "reset" };

function reducer(_state: QuoteMachineState, action: Action): QuoteMachineState {
  switch (action.type) {
    case "loading":
      return { phase: "loading-draft" };
    case "draftReady":
      return { phase: "draft-ready", draft: action.draft, quotedAt: action.quotedAt };
    case "promoting":
      return { phase: "promoting", draft: action.draft, quotedAt: action.quotedAt };
    case "promoted":
      return {
        phase: "promoted",
        draft: action.draft,
        promotedQuote: action.promotedQuote,
        correctedFrom: action.correctedFrom,
        quotedAt: action.quotedAt,
      };
    case "marketMoved":
      return {
        phase: "market-moved",
        originalDraft: action.originalDraft,
        newDraft: action.newDraft,
        retryCount: action.retryCount,
        quotedAt: action.quotedAt,
      };
    case "error":
      return { phase: "error", error: action.error, draft: action.draft };
    case "reset":
      return { phase: "idle" };
    default:
      return _state;
  }
}

export interface UseQuoteMachineOptions {
  /** Maximum number of re-draft attempts on a market-moved promote failure. Default 3. */
  maxRetries?: number;
}

export interface UseQuoteMachineReturn {
  state: QuoteMachineState;
  /** Build params from a `QuoteParams` and fetch a draft quote. Moves to `draft-ready`. */
  getDraft: (params: QuoteParams) => Promise<void>;
  /**
   * Promote a reviewed draft into a signed quote, in `riskMode` if given — a draft is always drawn
   * up as adaptive, so this is where a mode the user picked after seeing the draft is applied.
   * On market-moved, re-drafts and surfaces `market-moved`.
   */
  promote: (draft: Quote, retryCount?: number, riskMode?: RiskMode) => Promise<void>;
  /** Accept a re-drafted quote after a `market-moved` and promote it, in `riskMode` if given. */
  acceptChanges: (newDraft: Quote, retryCount: number, riskMode?: RiskMode) => Promise<void>;
  /** Promote pre-adjusted params directly via `createQuote` (e.g. after applying a correction hint). */
  correctAndPromote: (originalDraft: Quote, adjustedParams: CreateQuoteParams) => Promise<void>;
  reset: () => void;
}

export function useQuoteMachine(options?: UseQuoteMachineOptions): UseQuoteMachineReturn {
  const client = useDimesClient();
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const [state, dispatch] = useReducer(reducer, { phase: "idle" } as QuoteMachineState);
  const lastParamsRef = useRef<CreateQuoteParams | null>(null);
  const quotedAtRef = useRef(0);

  const getDraft = useCallback(
    async (params: QuoteParams): Promise<void> => {
      dispatch({ type: "loading" });
      const quoteParams = buildQuoteParams(params);
      lastParamsRef.current = quoteParams;
      try {
        const draft = await client.createDraftQuote(quoteParams);

        quotedAtRef.current = Date.now();
        dispatch({ type: "draftReady", draft, quotedAt: quotedAtRef.current });
      } catch (err) {
        dispatch({ type: "error", error: err });
      }
    },
    [client],
  );

  const promote = useCallback(
    async (draft: Quote, retryCount = 0, riskModeOverride?: RiskMode): Promise<void> => {
      const quotedAt = quotedAtRef.current;
      dispatch({ type: "promoting", draft, quotedAt });
      try {
        // A draft carries no mode — the promotion query decides it, and omitting it means adaptive.
        // The caller passes the mode the user picked off the draft's `committedUnwinds`; without one,
        // fall back to the mode the draft was requested with.
        const riskMode = riskModeOverride ?? lastParamsRef.current?.riskMode;
        const promotedQuote = await client.promoteDraftQuote(draft.id, riskMode ? { riskMode } : undefined);
        dispatch({ type: "promoted", draft, promotedQuote, quotedAt });
      } catch (err) {
        if (isMarketMovedError(err) && retryCount < maxRetries && lastParamsRef.current) {
          try {
            const newDraft = await client.createDraftQuote(lastParamsRef.current);
            // eslint-disable-next-line require-atomic-updates -- timestamp ref, no contended state
            quotedAtRef.current = Date.now();
            dispatch({
              type: "marketMoved",
              originalDraft: draft,
              newDraft,
              retryCount: retryCount + 1,
              quotedAt: quotedAtRef.current,
            });
          } catch (draftErr) {
            dispatch({ type: "error", error: draftErr, draft });
          }
        } else {
          dispatch({ type: "error", error: err, draft });
        }
      }
    },
    [client, maxRetries],
  );

  const acceptChanges = useCallback(
    async (newDraft: Quote, retryCount: number, riskMode?: RiskMode): Promise<void> => {
      await promote(newDraft, retryCount, riskMode);
    },
    [promote],
  );

  const correctAndPromote = useCallback(
    async (originalDraft: Quote, adjustedParams: CreateQuoteParams): Promise<void> => {
      dispatch({ type: "promoting", draft: originalDraft, quotedAt: quotedAtRef.current });
      lastParamsRef.current = adjustedParams;
      try {
        const promotedQuote = await client.createQuote(adjustedParams);
        // eslint-disable-next-line require-atomic-updates -- timestamp ref, no contended state
        quotedAtRef.current = Date.now();
        dispatch({
          type: "promoted",
          draft: promotedQuote,
          promotedQuote,
          correctedFrom: originalDraft,
          quotedAt: quotedAtRef.current,
        });
      } catch (err) {
        dispatch({ type: "error", error: err });
      }
    },
    [client],
  );

  const reset = useCallback((): void => {
    dispatch({ type: "reset" });
    lastParamsRef.current = null;
    quotedAtRef.current = 0;
  }, []);

  return { state, getDraft, promote, acceptChanges, correctAndPromote, reset };
}
