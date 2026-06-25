import type { QueryClient } from "@tanstack/react-query";
import type { Market, Paginated, Position } from "../types";
import type { MarketDelta, PositionEvent } from "../ws";

/**
 * Shared plumbing for merging WebSocket events into the React Query cache. Used by the optional
 * reconcile mode of `usePositionStream` / `useMarketStream` and the `reconcile` option on
 * `usePositions`. Kept internal so the query keys and the WS-timestamp registry stay in sync.
 */

export const positionsQueryKey = ["dimes", "positions"] as const;

export const marketsQueryKey = ["dimes", "markets"] as const;

export const defaultReconciliationWindowMs = 12_000;

/** Position statuses that indicate an in-flight transition — polled faster by `adaptivePolling`. */
export const transientPositionStatuses: ReadonlySet<string> = new Set(["pending", "closing", "settling", "unwinding"]);

/**
 * Records the last time each position id was written from a WebSocket event. Polling reconciliation
 * uses this so a slower REST poll never clobbers fresher WS data inside the reconciliation window.
 */
export const wsPositionTimestamps = new Map<string, number>();

/** Merge a single position event into every cached positions query. */
export function mergePositionEvent(queryClient: QueryClient, event: PositionEvent, now: number): void {
  const position = event.data;
  queryClient.setQueriesData<Position[]>({ queryKey: positionsQueryKey }, (old) => {
    if (!old) {
      return old;
    }
    const idx = old.findIndex((p) => p.id === position.id);
    if (idx >= 0) {
      const next = [...old];
      next[idx] = position;
      return next;
    }
    if (event.type === "position.created") {
      return [position, ...old];
    }
    return old;
  });
  wsPositionTimestamps.set(position.id, now);
}

/**
 * `structuralSharing` for a polled positions list: keep the cached (WS-fresher) copy of any position
 * updated over the socket within `windowMs`, otherwise accept the polled copy.
 */
export function reconcilePolledPositions(
  oldData: Position[] | undefined,
  newData: Position[],
  windowMs: number,
  now: number,
): Position[] {
  if (!oldData) {
    return newData;
  }
  return newData.map((polled) => {
    const wsTime = wsPositionTimestamps.get(polled.id);
    if (wsTime !== undefined && now - wsTime < windowMs) {
      const fresher = oldData.find((p) => p.id === polled.id);
      return fresher ?? polled;
    }
    if (wsTime !== undefined) {
      wsPositionTimestamps.delete(polled.id);
    }
    return polled;
  });
}

/**
 * Deep-merge a market delta onto a cached market. The nested `leverage` block must be merged rather
 * than replaced — a max-leverage delta carries only the changed leverage fields, so a shallow spread
 * would drop the constant `minBps`/`stepBps` until the next full refetch.
 */
function mergeMarket(prev: Market, delta: MarketDelta): Market {
  return {
    ...prev,
    ...delta,
    leverage: delta.leverage ? { ...prev.leverage, ...delta.leverage } : prev.leverage,
  };
}

/** Merge market deltas into every cached paginated markets query (no-op for ids not present). */
export function mergeMarketDeltas(queryClient: QueryClient, deltas: MarketDelta[]): void {
  queryClient.setQueriesData<Paginated<Market>>({ queryKey: marketsQueryKey }, (old) => {
    if (!old) {
      return old;
    }
    const data = old.data.map((market) => {
      const delta = deltas.find((d) => d.id === market.id);
      return delta ? mergeMarket(market, delta) : market;
    });
    const changed = data.some((market, i) => market !== old.data[i]);
    return changed ? { ...old, data } : old;
  });
}
