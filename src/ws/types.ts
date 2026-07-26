import type { Market, MarketLeverage, MarketPolymarket, Position } from "../types";

export const positionEventTypes = [
  "position.cancelled",
  "position.close_requested",
  "position.closed",
  "position.created",
  "position.force_unwound",
  "position.liquidated",
  "position.opened",
  "position.opening",
  "position.partial_close_requested",
  "position.partial_close_initiated",
  "position.partial_closed",
  "position.partial_close_aborted",
  "position.reverted",
  "position.settled",
  "position.settlement_state_changed",
] as const;

export type PositionEventType = (typeof positionEventTypes)[number];

export interface PositionEventEnvelope {
  id: string;
  type: PositionEventType;
  created_at: string;
  data: Record<string, unknown>;
}

export interface PositionEvent {
  id: string;
  type: PositionEventType;
  createdAt: string;
  data: Position;
}

export const marketEventTypes = [
  "market.discovered",
  "market.eligibility_changed",
  "market.max_leverage_changed",
  "market.settlement_state_changed",
] as const;

export type MarketEventType = (typeof marketEventTypes)[number];

export type MarketDelta = Pick<Market, "id"> & {
  polymarket: MarketPolymarket;
  leverage?: MarketLeverage;
} & Partial<Omit<Market, "id" | "leverage">>;

export interface MarketEventEnvelope {
  id: string;
  type: MarketEventType;
  created_at: string;
  data: Record<string, unknown>[];
}

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  createdAt: string;
  data: Market[] | MarketDelta[];
}

export interface NotificationEventEnvelope {
  id: string;
  type: "notification";
  created_at: string;
  data: {
    code: string;
    message: string;
    params?: Record<string, unknown>;
  };
}

export interface NotificationEvent {
  id: string;
  type: "notification";
  createdAt: string;
  data: {
    code: string;
    message: string;
    params?: Record<string, unknown>;
  };
}

export const notificationCodes = {
  orderFulfillmentRetrying: "ORDER_FULFILLMENT_RETRYING",
} as const;

export type NotificationCode = (typeof notificationCodes)[keyof typeof notificationCodes];
