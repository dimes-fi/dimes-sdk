import { camelizeKeys, type Camelized } from "humps";
import { DimesApiError } from "../errors/dimes-error";
import type { AuthProvider } from "./auth";

export type { Camelized };

interface ApiErrorBody {
  error?: {
    type?: string;
    code?: string;
    message: string;
    params?: Record<string, unknown>;
  };
}

const HTTP_UNAUTHORIZED = 401;
const HTTP_TOO_MANY_REQUESTS = 429;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_MAX_RETRY_DELAY_MS = 60_000;
const DEFAULT_RETRY_DELAY_MS = 1000;
const BACKOFF_FACTOR = 2;
const MS_PER_SECOND = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(header: string | null, attempt: number): number {
  const fallbackMs = DEFAULT_RETRY_DELAY_MS * BACKOFF_FACTOR ** attempt;
  if (!header) {
    return fallbackMs;
  }

  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * MS_PER_SECOND;
  }

  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }

  return fallbackMs;
}

// eslint-disable-next-line complexity
async function throwFromResponse(response: Response): Promise<never> {
  const rawBody = await response.text();
  let parsed: ApiErrorBody | null;
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as ApiErrorBody) : null;
  } catch {
    parsed = null;
  }

  const code = parsed?.error?.code ?? "unknown_error";
  const type = parsed?.error?.type ?? null;
  const message = parsed?.error?.message ?? `API error ${response.status}`;
  const rawParams = parsed?.error?.params;
  const params = rawParams ? (camelizeKeys(rawParams) as Record<string, unknown>) : null;

  throw new DimesApiError({ status: response.status, code, type, message, params });
}

export interface HttpClientOptions {
  baseUrl: string;
  auth: AuthProvider;
  fetch?: typeof globalThis.fetch;
  maxRetries?: number;
  maxRetryDelayMs?: number;
}

export class HttpClient {
  private readonly baseUrl: string;

  private readonly auth: AuthProvider;

  private readonly fetchFn: typeof globalThis.fetch;

  private readonly maxRetries: number;

  private readonly maxRetryDelayMs: number;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.auth = options.auth;
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.maxRetryDelayMs = options.maxRetryDelayMs ?? DEFAULT_MAX_RETRY_DELAY_MS;
  }

  public async request<T>(path: string, options?: RequestInit): Promise<T> {
    const authHeaders = await this.auth.getHeaders();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options?.headers as Record<string, string> | undefined),
    };

    let response = await this.fetchFn(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === HTTP_UNAUTHORIZED && this.auth.refresh) {
      await this.auth.refresh();
      const retryHeaders = await this.auth.getHeaders();
      response = await this.fetchFn(`${this.baseUrl}${path}`, {
        ...options,
        headers: { ...headers, ...retryHeaders },
      });
    }

    for (let attempt = 0; response.status === HTTP_TOO_MANY_REQUESTS && attempt < this.maxRetries; attempt++) {
      const delayMs = parseRetryAfterMs(response.headers.get("retry-after"), attempt);
      if (delayMs > this.maxRetryDelayMs) {
        break;
      }
      await sleep(delayMs);
      const freshAuth = await this.auth.getHeaders();
      response = await this.fetchFn(`${this.baseUrl}${path}`, {
        ...options,
        headers: { ...headers, ...freshAuth },
      });
    }

    if (!response.ok) {
      await throwFromResponse(response);
    }

    return camelizeKeys(await response.json()) as T;
  }

  public async requestList<T>(path: string, options?: RequestInit): Promise<T[]> {
    const result = await this.request<{ data: T[] }>(path, options);
    return result.data;
  }
}
