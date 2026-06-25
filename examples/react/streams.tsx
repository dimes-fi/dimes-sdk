/**
 * React — live positions with WebSocket reconciliation.
 *
 * `usePositions` fetches over HTTP; `usePositionStream` opens the position socket and,
 * in `reconcile` mode (the default), merges incoming events straight into the
 * `usePositions` cache — no refetch, no manual wiring. `useMarketStream` does the same
 * for market eligibility / max-leverage changes against `useMarkets`.
 *
 * Mount these anywhere inside a `DimesProvider` (see trade-panel.tsx).
 */
import { usePositions, usePositionStream, useMarketStream } from "@dimes-dot-fi/sdk/react";

export function LivePositions() {
  // `reconcile: true` lets the stream patch this exact query's cache.
  const positions = usePositions({ status: "open" }, undefined, { reconcile: true });

  const { connected } = usePositionStream({ mode: "reconcile" });
  useMarketStream({ mode: "reconcile" });

  return (
    <div>
      <p>Live updates: {connected ? "connected" : "reconnecting…"}</p>
      <ul>
        {positions.data?.map((position) => (
          <li key={position.id}>
            {position.marketTicker} {position.side} — {position.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
