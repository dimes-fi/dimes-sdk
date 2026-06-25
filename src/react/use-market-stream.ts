import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { MarketSocket, type MarketDelta, type MarketEvent } from "../ws";
import { useDimesClient } from "./provider";
import type { StreamMode } from "./use-position-stream";
import { marketsQueryKey, mergeMarketDeltas } from "./ws-reconcile";

export interface UseMarketStreamOptions {
  /** Connect the socket. Default true. */
  enabled?: boolean;
  /**
   * `"reconcile"` (default) merges `eligibility_changed` / `max_leverage_changed` deltas into the
   * `useMarkets` query cache; `"raw"` only forwards events. `market.discovered` events are never
   * injected into the paginated cache (that would pollute server-filtered views) — handle them via
   * `onEvent` in either mode.
   */
  mode?: StreamMode;
  /** Disconnect while the tab is hidden and reconnect when visible again. Default true. */
  pauseOnHidden?: boolean;
  /** Invalidate the markets query on reconnect (skipping the first connect). Default true. */
  invalidateOnReconnect?: boolean;
  /** Always called with the raw (camelCased) event, in both modes. */
  onEvent?: (event: MarketEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
}

export interface UseMarketStreamResult {
  socket: MarketSocket | null;
  connected: boolean;
}

/**
 * Subscribe to the user market WebSocket gateway. In `reconcile` mode (default) eligibility and
 * max-leverage deltas are deep-merged into the `useMarkets` cache; discovered markets are forwarded
 * to `onEvent` for the app to route (e.g. a "new markets" strip).
 */
export function useMarketStream(options?: UseMarketStreamOptions): UseMarketStreamResult {
  const client = useDimesClient();
  const queryClient = useQueryClient();
  const socketRef = useRef<MarketSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const enabled = options?.enabled ?? true;
  const mode = options?.mode ?? "reconcile";
  const pauseOnHidden = options?.pauseOnHidden ?? true;
  const invalidateOnReconnect = options?.invalidateOnReconnect ?? true;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const socket = new MarketSocket({
      baseUrl: client.baseUrl,
      getToken: (): string | null => client.getToken(),
    });
    socketRef.current = socket;

    const unsubEvent = socket.on("*", (event) => {
      if (mode === "reconcile" && event.type !== "market.discovered") {
        mergeMarketDeltas(queryClient, event.data as MarketDelta[]);
      }
      optionsRef.current?.onEvent?.(event);
    });

    let firstConnect = true;
    const unsubConnect = socket.onConnect(() => {
      setConnected(true);
      if (firstConnect) {
        firstConnect = false;
      } else if (mode === "reconcile" && invalidateOnReconnect) {
        void queryClient.invalidateQueries({ queryKey: marketsQueryKey });
      }
      optionsRef.current?.onConnect?.();
    });

    const unsubDisconnect = socket.onDisconnect(() => {
      setConnected(false);
      optionsRef.current?.onDisconnect?.();
    });

    const unsubError = socket.onError((error) => {
      optionsRef.current?.onError?.(error);
    });

    const handleVisibility =
      pauseOnHidden && typeof document !== "undefined"
        ? (): void => {
            if (document.hidden) {
              socket.disconnect();
            } else {
              socket.connect();
            }
          }
        : null;
    if (handleVisibility) {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    socket.connect();

    return (): void => {
      if (handleVisibility) {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
      unsubEvent();
      unsubConnect();
      unsubDisconnect();
      unsubError();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [client, queryClient, enabled, mode, pauseOnHidden, invalidateOnReconnect]);

  return { socket: socketRef.current, connected };
}
