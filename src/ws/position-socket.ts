import { camelizeKeys } from "humps";
import { io, type Socket } from "socket.io-client";
import type { Position } from "../types";
import {
  positionEventTypes,
  type NotificationEvent,
  type NotificationEventEnvelope,
  type PositionEvent,
  type PositionEventEnvelope,
  type PositionEventType,
} from "./types";

export interface PositionSocketOptions {
  baseUrl?: string;
  getToken: () => string | null;
}

type EventCallback = (event: PositionEvent) => void;
type NotificationCallback = (event: NotificationEvent) => void;
type ConnectionCallback = () => void;
type ErrorCallback = (error: unknown) => void;

const wsNamespace = "/v1/ws/prediction-markets/user-positions";

function camelizeEnvelope(envelope: PositionEventEnvelope): PositionEvent {
  return {
    id: envelope.id,
    type: envelope.type,
    createdAt: envelope.created_at,
    data: camelizeKeys(envelope.data) as unknown as Position,
  };
}

export class PositionSocket {
  private socket: Socket | null = null;

  private readonly baseUrl: string;

  private readonly getToken: () => string | null;

  private readonly eventListeners = new Map<string, Set<EventCallback>>();

  private readonly connectListeners = new Set<ConnectionCallback>();

  private readonly disconnectListeners = new Set<ConnectionCallback>();

  private readonly errorListeners = new Set<ErrorCallback>();

  private readonly notificationListeners = new Set<NotificationCallback>();

  constructor(options: PositionSocketOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.dimes.fi";
    this.getToken = options.getToken;
  }

  public get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket?.disconnect();

    const token = this.getToken();
    if (!token) {
      return;
    }

    const getToken = this.getToken;
    this.socket = io(`${this.baseUrl}${wsNamespace}`, {
      auth: (cb) => cb({ token: getToken() }),
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on("connect", () => {
      for (const cb of this.connectListeners) {
        cb();
      }
    });

    this.socket.on("disconnect", () => {
      for (const cb of this.disconnectListeners) {
        cb();
      }
    });

    this.socket.on("error", (err: unknown) => {
      for (const cb of this.errorListeners) {
        cb(err);
      }
    });

    for (const eventType of positionEventTypes) {
      this.socket.on(eventType, (envelope: PositionEventEnvelope) => {
        const event = camelizeEnvelope(envelope);
        this.emit(eventType, event);
        this.emit("*", event);
      });
    }

    this.socket.on("notification", (envelope: NotificationEventEnvelope) => {
      const event: NotificationEvent = {
        id: envelope.id,
        type: "notification",
        createdAt: envelope.created_at,
        data: envelope.data,
      };
      for (const cb of this.notificationListeners) {
        cb(event);
      }
    });
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  public reconnectWithToken(): void {
    this.disconnect();
    this.connect();
  }

  public on(event: PositionEventType | "*", cb: EventCallback): () => void {
    let set = this.eventListeners.get(event);
    if (!set) {
      set = new Set();
      this.eventListeners.set(event, set);
    }
    set.add(cb);
    return () => set.delete(cb);
  }

  public onConnect(cb: ConnectionCallback): () => void {
    this.connectListeners.add(cb);
    return () => this.connectListeners.delete(cb);
  }

  public onDisconnect(cb: ConnectionCallback): () => void {
    this.disconnectListeners.add(cb);
    return () => this.disconnectListeners.delete(cb);
  }

  public onError(cb: ErrorCallback): () => void {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }

  public onNotification(cb: NotificationCallback): () => void {
    this.notificationListeners.add(cb);
    return () => this.notificationListeners.delete(cb);
  }

  private emit(event: string, data: PositionEvent): void {
    const set = this.eventListeners.get(event);
    if (!set) {
      return;
    }
    for (const cb of set) {
      cb(data);
    }
  }
}
