export { DimesProvider, useDimesClient } from "./provider";

export type { DimesProviderProps } from "./provider";

export { useQuote } from "./use-quote";

export type { UseQuoteReturn, QuoteState, QuotePhase } from "./use-quote";

export { useQuoteMachine } from "./use-quote-machine";

export type { UseQuoteMachineReturn, UseQuoteMachineOptions, QuoteMachineState } from "./use-quote-machine";

// eslint-disable-next-line @typescript-eslint/no-deprecated -- back-compat re-export of deprecated hook
export { useMarkets, useMarket, useSearchMarkets } from "./use-markets";

export { usePositions } from "./use-positions";

export type { UsePositionsOptions } from "./use-positions";

export { useContractInfo } from "./use-contract-info";

export { usePositionPartialCloses } from "./use-partial-closes";

// eslint-disable-next-line @typescript-eslint/no-deprecated -- re-export of intentional back-compat alias
export { useLimits, useUserLimits, usePartnerLimits } from "./use-limits";

export { useCancelPosition } from "./use-cancel-position";

export type { CancelPositionResult, UseCancelPositionOptions } from "./use-cancel-position";

export { usePositionStream } from "./use-position-stream";

export type { StreamMode, UsePositionStreamOptions, UsePositionStreamResult } from "./use-position-stream";

export { useMarketStream } from "./use-market-stream";

export type { UseMarketStreamOptions, UseMarketStreamResult } from "./use-market-stream";
