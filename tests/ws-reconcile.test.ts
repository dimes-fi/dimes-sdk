import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import {
  marketsQueryKey,
  mergeMarketDeltas,
  mergePositionEvent,
  positionsQueryKey,
  reconcilePolledPositions,
  wsPositionTimestamps,
} from "../src/react/ws-reconcile";
import type { Market, Paginated, Position } from "../src/types";
import type { MarketDelta, PositionEvent } from "../src/ws";

function pos(id: string, status: string): Position {
  return { id, status } as unknown as Position;
}

describe("reconcilePolledPositions", () => {
  beforeEach(() => wsPositionTimestamps.clear());

  it("returns polled data when there is no prior cache", () => {
    const next = [pos("a", "open")];
    expect(reconcilePolledPositions(undefined, next, 12_000, 1_000)).toBe(next);
  });

  it("keeps the WS-fresher copy inside the reconciliation window", () => {
    wsPositionTimestamps.set("a", 1_000);
    const old = [pos("a", "opening")];
    const polled = [pos("a", "pending")];
    expect(reconcilePolledPositions(old, polled, 12_000, 5_000)[0]).toBe(old[0]);
  });

  it("accepts the polled copy once the window elapses and forgets the timestamp", () => {
    wsPositionTimestamps.set("a", 1_000);
    const old = [pos("a", "opening")];
    const polled = [pos("a", "open")];
    expect(reconcilePolledPositions(old, polled, 12_000, 20_000)[0]).toBe(polled[0]);
    expect(wsPositionTimestamps.has("a")).toBe(false);
  });
});

describe("mergePositionEvent", () => {
  beforeEach(() => wsPositionTimestamps.clear());

  it("replaces an existing position and stamps its timestamp", () => {
    const qc = new QueryClient();
    qc.setQueryData([...positionsQueryKey, undefined], [pos("a", "pending")]);
    const event = { type: "position.opened", data: pos("a", "open") } as unknown as PositionEvent;

    mergePositionEvent(qc, event, 7_000);

    const data = qc.getQueryData<Position[]>([...positionsQueryKey, undefined]);
    expect(data?.[0].status).toBe("open");
    expect(wsPositionTimestamps.get("a")).toBe(7_000);
  });

  it("prepends on position.created but ignores unknown ids for other events", () => {
    const qc = new QueryClient();
    const key = [...positionsQueryKey, undefined];
    qc.setQueryData(key, [pos("a", "open")]);

    mergePositionEvent(qc, { type: "position.created", data: pos("b", "pending") } as unknown as PositionEvent, 1);
    expect(qc.getQueryData<Position[]>(key)?.map((p) => p.id)).toEqual(["b", "a"]);

    mergePositionEvent(qc, { type: "position.opened", data: pos("c", "open") } as unknown as PositionEvent, 2);
    expect(qc.getQueryData<Position[]>(key)?.map((p) => p.id)).toEqual(["b", "a"]);
  });
});

describe("mergeMarketDeltas", () => {
  function market(id: string): Market {
    return {
      id,
      acceptingNewPositions: true,
      leverage: { maxBps: 50_000, minBps: 10_000, stepBps: 2_500 },
    } as unknown as Market;
  }

  it("deep-merges the leverage block so minBps/stepBps survive a max-leverage delta", () => {
    const qc = new QueryClient();
    const key = [...marketsQueryKey, undefined];
    qc.setQueryData<Paginated<Market>>(key, { data: [market("m1")], hasMore: false });

    const delta = { id: "m1", leverage: { maxBps: 30_000 } } as unknown as MarketDelta;
    mergeMarketDeltas(qc, [delta]);

    const merged = qc.getQueryData<Paginated<Market>>(key)?.data[0].leverage as {
      maxBps: number;
      minBps: number;
      stepBps: number;
    };
    expect(merged.maxBps).toBe(30_000);
    expect(merged.minBps).toBe(10_000);
    expect(merged.stepBps).toBe(2_500);
  });

  it("is a no-op for ids not present in the page", () => {
    const qc = new QueryClient();
    const key = [...marketsQueryKey, undefined];
    const page: Paginated<Market> = { data: [market("m1")], hasMore: false };
    qc.setQueryData(key, page);

    mergeMarketDeltas(qc, [{ id: "absent", acceptingNewPositions: false } as unknown as MarketDelta]);
    expect(qc.getQueryData<Paginated<Market>>(key)).toBe(page);
  });
});
