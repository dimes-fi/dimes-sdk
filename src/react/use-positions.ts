import { useQuery, type Query, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { GetPositionsParams } from "../client/dimes-client";
import type { Position } from "../types";
import { useDimesClient } from "./provider";
import { defaultReconciliationWindowMs, reconcilePolledPositions, transientPositionStatuses } from "./ws-reconcile";

const DEFAULT_FAST_POLL_MS = 5_000;
const DEFAULT_SLOW_POLL_MS = 15_000;

export interface UsePositionsOptions {
  /**
   * Appended to the query key so changing scope (e.g. switching wallet) does not serve the previous
   * scope's cached positions until a refetch. Omit to keep the default, scope-less cache key.
   */
  scope?: string | null;
  /**
   * Poll faster while any position is in a transient state (pending/closing/settling/unwinding) and
   * slower otherwise. Pass `true` for the defaults (5s / 15s) or an object to tune them.
   */
  adaptivePolling?: boolean | { fastMs?: number; slowMs?: number };
  /**
   * Defer to fresher WebSocket data: when a position was updated over the socket within the
   * reconciliation window, a slower REST poll won't overwrite it. Use with `usePositionStream` in
   * reconcile mode. Pass `true` for the default window or a number of milliseconds.
   */
  reconcile?: boolean | number;
}

function adaptiveRefetchInterval(
  adaptive: NonNullable<UsePositionsOptions["adaptivePolling"]>,
): (query: Query<Position[]>) => number {
  const fastMs = typeof adaptive === "object" ? (adaptive.fastMs ?? DEFAULT_FAST_POLL_MS) : DEFAULT_FAST_POLL_MS;
  const slowMs = typeof adaptive === "object" ? (adaptive.slowMs ?? DEFAULT_SLOW_POLL_MS) : DEFAULT_SLOW_POLL_MS;
  return (query) => (query.state.data?.some((p) => transientPositionStatuses.has(p.status)) ? fastMs : slowMs);
}

function reconcileStructuralSharing(reconcile: number | true): (oldData: unknown, newData: unknown) => Position[] {
  const windowMs = typeof reconcile === "number" ? reconcile : defaultReconciliationWindowMs;
  return (oldData, newData) =>
    reconcilePolledPositions(oldData as Position[] | undefined, newData as Position[], windowMs, Date.now());
}

export function usePositions(
  params?: GetPositionsParams,
  queryOptions?: Partial<UseQueryOptions<Position[]>>,
  options?: UsePositionsOptions,
): UseQueryResult<Position[]> {
  const client = useDimesClient();

  const queryKey =
    options?.scope !== undefined ? ["dimes", "positions", params, options.scope] : ["dimes", "positions", params];

  const config: UseQueryOptions<Position[]> = {
    queryKey,
    queryFn: () => client.getPositions(params),
  };

  if (options?.adaptivePolling) {
    config.refetchInterval = adaptiveRefetchInterval(options.adaptivePolling);
  }

  if (options?.reconcile) {
    config.structuralSharing = reconcileStructuralSharing(options.reconcile);
  }

  return useQuery({ ...config, ...queryOptions });
}
