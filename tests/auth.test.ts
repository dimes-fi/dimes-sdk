import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiKeyAuth, JwtAuth } from "../src/client/auth";
import { DimesError } from "../src/errors/dimes-error";

function tokenResponse(token: string, expiresAt: Date) {
  return new Response(JSON.stringify({ token, expires_at: expiresAt.toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ApiKeyAuth", () => {
  let fetchFn: ReturnType<typeof vi.fn> & typeof globalThis.fetch;

  beforeEach(() => {
    fetchFn = vi.fn() as ReturnType<typeof vi.fn> & typeof globalThis.fetch;
    vi.useRealTimers();
  });

  function createAuth() {
    return new ApiKeyAuth({
      apiKey: "test-api-key",
      walletAddress: "0xabc",
      baseUrl: "https://api.example.com",
      fetch: fetchFn,
    });
  }

  it("fetches JWT token on first getHeaders() call", async () => {
    const expiresAt = new Date(Date.now() + 3600_000);
    fetchFn.mockResolvedValueOnce(tokenResponse("jwt-123", expiresAt));

    const auth = createAuth();
    const headers = await auth.getHeaders();

    expect(headers).toEqual({ Authorization: "Bearer jwt-123" });
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.example.com/v1/prediction-markets/tokens",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Api-Key test-api-key",
        }),
        body: JSON.stringify({ wallet_address: "0xabc" }),
      }),
    );
  });

  it("caches JWT and reuses on subsequent calls", async () => {
    const expiresAt = new Date(Date.now() + 3600_000);
    fetchFn.mockResolvedValueOnce(tokenResponse("jwt-cached", expiresAt));

    const auth = createAuth();
    const h1 = await auth.getHeaders();
    const h2 = await auth.getHeaders();

    expect(h1).toEqual({ Authorization: "Bearer jwt-cached" });
    expect(h2).toEqual({ Authorization: "Bearer jwt-cached" });
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("refreshes when token is about to expire (within 30s buffer)", async () => {
    vi.useFakeTimers();

    // First token expires in 60s
    const firstExpiry = new Date(Date.now() + 60_000);
    fetchFn.mockResolvedValueOnce(tokenResponse("jwt-first", firstExpiry));

    const auth = createAuth();
    await auth.getHeaders();
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Advance time so we're within 30s of expiry
    vi.advanceTimersByTime(35_000);

    const secondExpiry = new Date(Date.now() + 3600_000);
    fetchFn.mockResolvedValueOnce(tokenResponse("jwt-refreshed", secondExpiry));

    const headers = await auth.getHeaders();
    expect(headers).toEqual({ Authorization: "Bearer jwt-refreshed" });
    expect(fetchFn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("coalesces concurrent refresh calls (only one fetch)", async () => {
    const expiresAt = new Date(Date.now() + 3600_000);
    fetchFn.mockResolvedValueOnce(tokenResponse("jwt-coalesced", expiresAt));

    const auth = createAuth();

    // Fire multiple concurrent getHeaders calls
    const [h1, h2, h3] = await Promise.all([auth.getHeaders(), auth.getHeaders(), auth.getHeaders()]);

    expect(h1).toEqual({ Authorization: "Bearer jwt-coalesced" });
    expect(h2).toEqual({ Authorization: "Bearer jwt-coalesced" });
    expect(h3).toEqual({ Authorization: "Bearer jwt-coalesced" });
    // Only one fetch should have been made
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("throws DimesError on failed token fetch", async () => {
    fetchFn.mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));

    const auth = createAuth();

    try {
      await auth.getHeaders();
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DimesError);
      expect((err as DimesError).message).toMatch(/Failed to obtain auth token/);
      expect((err as DimesError).message).toContain("403");
    }
  });

  it("uses custom fetch function", async () => {
    const customFetch = vi.fn().mockResolvedValueOnce(tokenResponse("jwt-custom", new Date(Date.now() + 3600_000)));

    const auth = new ApiKeyAuth({
      apiKey: "key",
      walletAddress: "0x1",
      fetch: customFetch,
    });

    await auth.getHeaders();

    expect(customFetch).toHaveBeenCalledOnce();
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

describe("JwtAuth", () => {
  let tokenFetchFn: ReturnType<typeof vi.fn> & typeof globalThis.fetch;

  beforeEach(() => {
    tokenFetchFn = vi.fn() as ReturnType<typeof vi.fn> & typeof globalThis.fetch;
  });

  it("fetches token from tokenUrl and returns Authorization header", async () => {
    const expiresAt = new Date(Date.now() + 3600_000);
    tokenFetchFn.mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "jwt-from-backend", expires_at: expiresAt.toISOString() }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const auth = new JwtAuth({ tokenUrl: "https://my-app.com/api/dimes-token", fetch: tokenFetchFn });
    const headers = await auth.getHeaders();

    expect(headers).toEqual({ Authorization: "Bearer jwt-from-backend" });
    expect(tokenFetchFn).toHaveBeenCalledWith("https://my-app.com/api/dimes-token");
  });

  it("caches token and reuses until near expiry", async () => {
    const expiresAt = new Date(Date.now() + 3600_000);
    tokenFetchFn.mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "jwt-cached", expires_at: expiresAt.toISOString() }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const auth = new JwtAuth({ tokenUrl: "https://my-app.com/api/token", fetch: tokenFetchFn });
    await auth.getHeaders();
    await auth.getHeaders();

    expect(tokenFetchFn).toHaveBeenCalledOnce();
  });

  it("throws DimesError when tokenUrl returns non-ok response", async () => {
    tokenFetchFn.mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));

    const auth = new JwtAuth({ tokenUrl: "https://my-app.com/api/token", fetch: tokenFetchFn });

    try {
      await auth.getHeaders();
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DimesError);
      expect((err as DimesError).message).toContain("403");
    }
  });
});
