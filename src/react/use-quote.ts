import { useCallback, useReducer } from "react";
import { executeQuote } from "../quote/quote";
import type { HintAdjustment } from "../quote/quote-error-hints";
import type { Quote } from "../types";
import type { QuoteOptions, QuoteParams, QuoteResult } from "../types/quote";
import { useDimesClient } from "./provider";

export type QuotePhase = "idle" | "loading-draft" | "draft-ready" | "promoting" | "promoted" | "market-moved" | "error";

export interface QuoteState {
  phase: QuotePhase;
  draft?: Quote;
  quote?: Quote;
  /** @deprecated Renamed to {@link QuoteState.quote}. Still populated for backward compatibility. */
  // eslint-disable-next-line no-restricted-syntax -- intentional deprecated alias field
  offer?: Quote;
  corrections: HintAdjustment[];
  retries: number;
  error?: unknown;
}

type Action =
  | { type: "loading" }
  | { type: "draftReady"; draft: Quote }
  | { type: "promoting" }
  | { type: "marketMoved" }
  | { type: "done"; result: QuoteResult }
  | { type: "error"; error: unknown }
  | { type: "reset" };

function reducer(state: QuoteState, action: Action): QuoteState {
  switch (action.type) {
    case "loading":
      return { phase: "loading-draft", corrections: [], retries: 0 };
    case "draftReady":
      return { ...state, phase: "draft-ready", draft: action.draft };
    case "promoting":
      return { ...state, phase: "promoting" };
    case "marketMoved":
      return { ...state, phase: "market-moved" };
    case "done":
      return {
        phase: "promoted",
        quote: action.result.quote,
        offer: action.result.quote,
        corrections: action.result.corrections,
        retries: action.result.retries,
        draft: state.draft,
      };
    case "error":
      return { ...state, phase: "error", error: action.error };
    case "reset":
      return { phase: "idle", corrections: [], retries: 0 };
    default:
      return state;
  }
}

export interface UseQuoteReturn {
  state: QuoteState;
  execute: (params: QuoteParams, options?: QuoteOptions) => Promise<QuoteResult>;
  reset: () => void;
}

export function useQuote(): UseQuoteReturn {
  const client = useDimesClient();
  const [state, dispatch] = useReducer(reducer, {
    phase: "idle",
    corrections: [],
    retries: 0,
  });

  const execute = useCallback(
    async (params: QuoteParams, options?: QuoteOptions): Promise<QuoteResult> => {
      dispatch({ type: "loading" });

      try {
        const result = await executeQuote(client, params, {
          ...options,
          onDraftReady: (draft) => {
            dispatch({ type: "draftReady", draft });
            dispatch({ type: "promoting" });
            options?.onDraftReady?.(draft);
          },
          onMarketMoved: (event) => {
            dispatch({ type: "marketMoved" });
            return options?.onMarketMoved?.(event);
          },
          onCorrection: (adj) => {
            return options?.onCorrection?.(adj);
          },
        });

        dispatch({ type: "done", result });
        return result;
      } catch (err) {
        dispatch({ type: "error", error: err });
        throw err;
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { state, execute, reset };
}
