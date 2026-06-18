import { DimesError } from "../errors/dimes-error";

export interface AuthProvider {
  getHeaders(): Promise<Record<string, string>>;
  refresh?(): Promise<void>;
}

interface TokenResponse {
  token: string;
  expires_at: string;
}

export interface ApiKeyAuthOptions {
  apiKey: string;
  walletAddress: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export class ApiKeyAuth implements AuthProvider {
  private jwt: string | null = null;

  private expiresAt = 0;

  private refreshPromise: Promise<void> | null = null;

  private readonly apiKey: string;

  private readonly walletAddress: string;

  private readonly baseUrl: string;

  private readonly fetchFn: typeof globalThis.fetch;

  constructor(options: ApiKeyAuthOptions) {
    this.apiKey = options.apiKey;
    this.walletAddress = options.walletAddress;
    this.baseUrl = options.baseUrl ?? "https://api.dimes.fi";
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  public async getHeaders(): Promise<Record<string, string>> {
    const TOKEN_EXPIRY_BUFFER_MS = 30_000;
    if (!this.jwt || Date.now() >= this.expiresAt - TOKEN_EXPIRY_BUFFER_MS) {
      await this.refresh();
    }
    return { Authorization: `Bearer ${this.jwt}` };
  }

  public async refresh(): Promise<void> {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    this.refreshPromise = this.fetchToken();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async fetchToken(): Promise<void> {
    const response = await this.fetchFn(`${this.baseUrl}/v1/prediction-markets/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ wallet_address: this.walletAddress }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new DimesError("auth_token_failed", `Failed to obtain auth token (${response.status}): ${text}`);
    }

    const data = (await response.json()) as TokenResponse;
    this.jwt = data.token;
    this.expiresAt = new Date(data.expires_at).getTime();
  }
}

export interface JwtAuthOptions {
  tokenUrl: string;
  fetch?: typeof globalThis.fetch;
}

export class JwtAuth implements AuthProvider {
  private readonly fetchFn: typeof globalThis.fetch;

  private readonly tokenUrl: string;

  private jwt: string | null = null;

  private expiresAt = 0;

  private refreshPromise: Promise<void> | null = null;

  constructor(options: JwtAuthOptions) {
    this.tokenUrl = options.tokenUrl;
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  public async getHeaders(): Promise<Record<string, string>> {
    const TOKEN_EXPIRY_BUFFER_MS = 30_000;
    if (!this.jwt || Date.now() >= this.expiresAt - TOKEN_EXPIRY_BUFFER_MS) {
      await this.refresh();
    }
    return { Authorization: `Bearer ${this.jwt}` };
  }

  public async refresh(): Promise<void> {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    this.refreshPromise = this.fetchToken();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async fetchToken(): Promise<void> {
    const response = await this.fetchFn(this.tokenUrl);

    if (!response.ok) {
      const text = await response.text();
      throw new DimesError(
        "auth_token_failed",
        `Failed to fetch token from ${this.tokenUrl} (${response.status}): ${text}`,
      );
    }

    const data = (await response.json()) as TokenResponse;
    this.jwt = data.token;
    this.expiresAt = new Date(data.expires_at).getTime();
  }
}
