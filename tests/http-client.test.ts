import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthProvider } from "../src/client/auth";
import { HttpClient } from "../src/client/http";
import { DimesApiError } from "../src/errors/dimes-error";

function mockAuth(headers: Record<string, string> = { Authorization: "Bearer test-token" }): AuthProvider {
  return {
    getHeaders: vi.fn().mockResolvedValue(headers),
    refresh: vi.fn().mockResolvedValue(undefined),
  };
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function textResponse(body: string, status: number, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers });
}

describe("HttpClient", () => {
  let auth: AuthProvider;
  let fetchFn: ReturnType<typeof vi.fn> & typeof globalThis.fetch;

  beforeEach(() => {
    auth = mockAuth();
    fetchFn = vi.fn() as ReturnType<typeof vi.fn> & typeof globalThis.fetch;
  });

  function createClient(overrides: { maxRetries?: number; maxRetryDelayMs?: number } = {}) {
    return new HttpClient({
      baseUrl: "https://api.example.com",
      auth,
      fetch: fetchFn,
      ...overrides,
    });
  }

  describe("successful GET request — returns camelized JSON", () => {
    it("camelizes snake_case keys in the response", async () => {
      fetchFn.mockResolvedValueOnce(jsonResponse({ user_name: "alice", account_balance: 100 }));

      const client = createClient();
      const result = await client.request<{ userName: string; accountBalance: number }>("/users/1");

      expect(result).toEqual({ userName: "alice", accountBalance: 100 });
      expect(fetchFn).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });
  });

  describe("POST request with body", () => {
    it("passes headers and body through", async () => {
      fetchFn.mockResolvedValueOnce(jsonResponse({ created: true }));

      const client = createClient();
      await client.request("/orders", {
        method: "POST",
        body: JSON.stringify({ market_id: "abc" }),
        headers: { "X-Custom": "value" },
      });

      expect(fetchFn).toHaveBeenCalledWith(
        "https://api.example.com/orders",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ market_id: "abc" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
            "X-Custom": "value",
          }),
        }),
      );
    });
  });

  describe("401 response triggers auth.refresh() and retries", () => {
    it("refreshes auth and retries on 401", async () => {
      const refreshedAuth = { Authorization: "Bearer refreshed-token" };
      (auth.getHeaders as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ Authorization: "Bearer test-token" })
        .mockResolvedValueOnce(refreshedAuth);

      fetchFn.mockResolvedValueOnce(jsonResponse({}, 401)).mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = createClient();
      const result = await client.request("/protected");

      expect(auth.refresh).toHaveBeenCalledOnce();
      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: true });
    });

    it("does not call refresh when auth has no refresh method", async () => {
      const noRefreshAuth: AuthProvider = {
        getHeaders: vi.fn().mockResolvedValue({ Authorization: "Bearer x" }),
      };

      fetchFn.mockResolvedValueOnce(jsonResponse({ error: { code: "unauthorized", message: "bad token" } }, 401));

      const client = new HttpClient({
        baseUrl: "https://api.example.com",
        auth: noRefreshAuth,
        fetch: fetchFn,
      });

      await expect(client.request("/protected")).rejects.toThrow(DimesApiError);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("429 response triggers retry with exponential backoff", () => {
    it("retries on 429 and succeeds", async () => {
      vi.useFakeTimers();

      fetchFn.mockResolvedValueOnce(jsonResponse({}, 429)).mockResolvedValueOnce(jsonResponse({ retried: true }));

      const client = createClient({ maxRetries: 3 });
      const promise = client.request("/rate-limited");

      // Advance past the default exponential backoff for attempt 0: 1000ms
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result).toEqual({ retried: true });
      expect(fetchFn).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe("Retry-After header parsing", () => {
    it("parses Retry-After as seconds", async () => {
      vi.useFakeTimers();

      fetchFn
        .mockResolvedValueOnce(jsonResponse({}, 429, { "Retry-After": "2" }))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = createClient();
      const promise = client.request("/limited");

      // 2 seconds from header
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toEqual({ ok: true });

      vi.useRealTimers();
    });

    it("parses Retry-After as HTTP date", async () => {
      vi.useFakeTimers();
      const now = Date.now();
      const futureDate = new Date(now + 3000).toUTCString();

      fetchFn
        .mockResolvedValueOnce(jsonResponse({}, 429, { "Retry-After": futureDate }))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = createClient();
      const promise = client.request("/limited");

      await vi.advanceTimersByTimeAsync(3000);

      const result = await promise;
      expect(result).toEqual({ ok: true });

      vi.useRealTimers();
    });

    it("falls back to exponential backoff when no header", async () => {
      vi.useFakeTimers();

      // No Retry-After header; attempt 0 fallback = 1000ms, attempt 1 fallback = 2000ms
      fetchFn
        .mockResolvedValueOnce(jsonResponse({}, 429))
        .mockResolvedValueOnce(jsonResponse({}, 429))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = createClient({ maxRetries: 3 });
      const promise = client.request("/limited");

      // attempt 0: 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      // attempt 1: 2000ms
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toEqual({ ok: true });
      expect(fetchFn).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });
  });

  describe("max retry delay exceeded — stops retrying", () => {
    it("throws when retry delay exceeds maxRetryDelayMs", async () => {
      fetchFn.mockResolvedValue(
        jsonResponse({ error: { code: "rate_limited", message: "too many requests" } }, 429, { "Retry-After": "120" }),
      );

      const client = createClient({ maxRetries: 5, maxRetryDelayMs: 10_000 });

      await expect(client.request("/limited")).rejects.toThrow(DimesApiError);
      // Initial request only, no retries because 120s > 10s max
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("error body parsing — structured API error", () => {
    it("creates DimesApiError with correct fields from structured error", async () => {
      fetchFn.mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              type: "validation_error",
              code: "invalid_param",
              message: "market_id is required",
              params: { field_name: "market_id" },
            },
          },
          400,
        ),
      );

      const client = createClient();

      try {
        await client.request("/orders");
        expect.unreachable("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(DimesApiError);
        const apiErr = err as DimesApiError;
        expect(apiErr.status).toBe(400);
        expect(apiErr.code).toBe("invalid_param");
        expect(apiErr.type).toBe("validation_error");
        expect(apiErr.rawMessage).toBe("market_id is required");
        // params should be camelized
        expect(apiErr.params).toEqual({ fieldName: "market_id" });
      }
    });
  });

  describe("non-JSON error body — still creates DimesApiError", () => {
    it("creates DimesApiError from plain text error body", async () => {
      fetchFn.mockResolvedValueOnce(textResponse("Internal Server Error", 500));

      const client = createClient();

      try {
        await client.request("/broken");
        expect.unreachable("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(DimesApiError);
        const apiErr = err as DimesApiError;
        expect(apiErr.status).toBe(500);
        expect(apiErr.code).toBe("unknown_error");
        expect(apiErr.type).toBeNull();
        expect(apiErr.params).toBeNull();
      }
    });
  });

  describe("custom fetch function is called", () => {
    it("uses the provided fetch function instead of globalThis.fetch", async () => {
      const customFetch = vi.fn().mockResolvedValueOnce(jsonResponse({ custom: true }));

      const client = new HttpClient({
        baseUrl: "https://api.example.com",
        auth,
        fetch: customFetch,
      });

      const result = await client.request<{ custom: boolean }>("/test");

      expect(result).toEqual({ custom: true });
      expect(customFetch).toHaveBeenCalledOnce();
      // The default fetchFn should not have been called
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe("requestList", () => {
    it("unwraps data array from response", async () => {
      fetchFn.mockResolvedValueOnce(jsonResponse({ data: [{ user_name: "a" }, { user_name: "b" }] }));

      const client = createClient();
      const result = await client.requestList<{ userName: string }>("/users");

      expect(result).toEqual([{ userName: "a" }, { userName: "b" }]);
    });
  });
});
