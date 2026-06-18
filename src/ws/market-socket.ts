import { camelizeKeys } from "humps";
import { io, type Socket } from "socket.io-client";
import type { Market } from "../types";
import {
  marketEventTypes,
  type MarketDelta,
  type MarketEvent,
  type MarketEventEnvelope,
  type MarketEventType,
} from "./types";

export interface MarketSocketOptions {
  baseUrl?: string;
  getToken: () => string | null;
}

type EventCallback = (event: MarketEvent) => void;
type ConnectionCallback = () => void;
type ErrorCallback = (error: unknown) => void;

const wsNamespace = "/v1/ws/prediction-markets/user-markets";

function camelizeEnvelope(envelope: MarketEventEnvelope): MarketEvent {
  return {
    id: envelope.id,
    type: envelope.type,
    createdAt: envelope.created_at,
    data: envelope.data.map((item) => camelizeKeys(item)) as unknown as Market[] | MarketDelta[],
  };
}

export class MarketSocket {
  private socket: Socket | null = null;

  private readonly baseUrl: string;

  private readonly getToken: () => string | null;

  private readonly eventListeners = new Map<string, Set<EventCallback>>();

  private readonly connectListeners = new Set<ConnectionCallback>();

  private readonly disconnectListeners = new Set<ConnectionCallback>();

  private readonly errorListeners = new Set<ErrorCallback>();

  constructor(options: MarketSocketOptions) {
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

    for (const eventType of marketEventTypes) {
      this.socket.on(eventType, (envelope: MarketEventEnvelope) => {
        const event = camelizeEnvelope(envelope);
        this.emit(eventType, event);
        this.emit("*", event);
      });
    }
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  public reconnectWithToken(): void {
    this.disconnect();
    this.connect();
  }

  public on(event: MarketEventType | "*", cb: EventCallback): () => void {
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

  private emit(event: string, data: MarketEvent): void {
    const set = this.eventListeners.get(event);
    if (!set) {
      return;
    }
    for (const cb of set) {
      cb(data);
    }
  }
}
