import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PositionSocket, type NotificationEvent, type PositionEvent } from "../ws";
import { useDimesClient } from "./provider";
import { mergePositionEvent, positionsQueryKey } from "./ws-reconcile";

export type StreamMode = "raw" | "reconcile";

export interface UsePositionStreamOptions {
  /** Connect the socket. Default true. Set false to gate on auth being ready. */
  enabled?: boolean;
  /**
   * `"reconcile"` (default) merges every event into the `usePositions` query cache so the UI updates
   * instantly; `"raw"` does not touch the cache and only forwards events to your callbacks.
   */
  mode?: StreamMode;
  /** Disconnect while the tab is hidden and reconnect when it becomes visible again. Default true. */
  pauseOnHidden?: boolean;
  /** Invalidate the positions query on reconnect (skipping the first connect) to catch missed events. Default true. */
  invalidateOnReconnect?: boolean;
  /** Always called with the raw (camelCased) event, in both modes. */
  onEvent?: (event: PositionEvent) => void;
  /** Called with user-gateway notification events (toasts, fill progress…). Never touches the cache. */
  onNotification?: (event: NotificationEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
}

export interface UsePositionStreamResult {
  socket: PositionSocket | null;
  connected: boolean;
}

/**
 * Subscribe to the user position WebSocket gateway. In `reconcile` mode (default) events are merged
 * into the React Query cache used by `usePositions`; in `raw` mode you handle events yourself via
 * `onEvent`. App-specific side effects (toasts, stores) belong in the callbacks, not the SDK.
 */
export function usePositionStream(options?: UsePositionStreamOptions): UsePositionStreamResult {
  const client = useDimesClient();
  const queryClient = useQueryClient();
  const socketRef = useRef<PositionSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const enabled = options?.enabled ?? true;
  const mode = options?.mode ?? "reconcile";
  const pauseOnHidden = options?.pauseOnHidden ?? true;
  const invalidateOnReconnect = options?.invalidateOnReconnect ?? true;

  // Keep the latest callbacks/flags in a ref so the socket effect does not reconnect on every render.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const socket = new PositionSocket({
      baseUrl: client.baseUrl,
      getToken: (): string | null => client.getToken(),
    });
    socketRef.current = socket;

    const unsubEvent = socket.on("*", (event) => {
      if (mode === "reconcile") {
        mergePositionEvent(queryClient, event, Date.now());
      }
      optionsRef.current?.onEvent?.(event);
    });

    const unsubNotification = socket.onNotification((event) => {
      optionsRef.current?.onNotification?.(event);
    });

    let firstConnect = true;
    const unsubConnect = socket.onConnect(() => {
      setConnected(true);
      if (firstConnect) {
        firstConnect = false;
      } else if (mode === "reconcile" && invalidateOnReconnect) {
        void queryClient.invalidateQueries({ queryKey: positionsQueryKey });
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
      unsubNotification();
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
