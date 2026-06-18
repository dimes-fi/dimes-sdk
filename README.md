<p align="center">
  <strong>@dimes-dot-fi/sdk</strong>
</p>

<p align="center">
  TypeScript SDK for building on <a href="https://dimes.fi">Dimes Multiply</a> — leveraged prediction markets.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dimes-dot-fi/sdk"><img src="https://img.shields.io/npm/v/@dimes-dot-fi/sdk.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@dimes-dot-fi/sdk"><img src="https://img.shields.io/npm/dm/@dimes-dot-fi/sdk.svg" alt="npm downloads"></a>
  <a href="https://github.com/nicktids"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
  <a href="https://docs.dimes.fi"><img src="https://img.shields.io/badge/docs-dimes.fi-black.svg" alt="docs"></a>
</p>

---

Dimes Multiply is a middle-layer protocol that lets trading terminals, wallets, and apps offer up to 10x leveraged exposure on prediction markets (Polymarket) without building internal leverage infrastructure. This SDK gives you a type-safe TypeScript client for the Multiply API, a quote engine with auto-correction, React hooks, and viem-compatible on-chain transaction builders.

## Features

- **Full API client** — typed methods for markets, quotes, positions, and contract info with automatic camelCase conversion
- **Quote engine** — `executeQuote()` handles the draft → promote flow, retries on market-moved errors, and auto-corrects leverage/collateral/slippage
- **React hooks** — `useMarkets()`, `usePositions()`, `useQuote()`, `useContractInfo()`, and more — works with your existing TanStack Query setup
- **On-chain builders** — viem-compatible transaction data for `createPosition`, `approve`, and `requestClose`
- **Signature verification** — verify quote signatures against the contract-info endpoint with per-client caching
- **Auth management** — `ApiKeyAuth` auto-obtains and refreshes JWTs; `JwtAuth` for static or dynamic tokens
- **Error handling** — typed `DimesApiError` with friendly messages, structured hints, and programmatic correction suggestions
- **Tree-shakeable** — three entry points, ESM + CJS, zero runtime dependencies beyond `humps`

## Install

```bash
npm install @dimes-dot-fi/sdk
```

## Entry Points

| Import | What | Peer deps |
|--------|------|-----------|
| `@dimes-dot-fi/sdk` | Client, quote engine, errors, types | — |
| `@dimes-dot-fi/sdk/react` | React hooks + provider | `react`, `@tanstack/react-query` |
| `@dimes-dot-fi/sdk/contract` | Tx builders, signature verification | `viem` |

## Quick Start

### Client setup

Your backend holds the Dimes API key and exposes an endpoint that generates JWTs for your users (see [Authentication](https://docs.dimes.fi/for-developers/authentication)). Point `JwtAuth` at that endpoint — it fetches, caches, and auto-refreshes tokens:

```typescript
import { DimesClient, JwtAuth } from "@dimes-dot-fi/sdk";

const client = new DimesClient({
  auth: new JwtAuth({
    tokenUrl: "https://your-backend.com/api/dimes-token",
  }),
});
```

For server-side (Node.js) where you hold the API key directly:

```typescript
import { DimesClient, ApiKeyAuth } from "@dimes-dot-fi/sdk";

const client = new DimesClient({
  auth: new ApiKeyAuth({
    apiKey: process.env.DIMES_API_KEY,
    walletAddress: "0x1234...abcd",
  }),
});
```

### Browse markets

```typescript
const { data: markets } = await client.getMarkets();
const market = await client.getMarket("will-btc-hit-100k-2026");

console.log(market.leverage.maxBps); // 100000 (10x)
```

### Execute a quote

```typescript
import { executeQuote } from "@dimes-dot-fi/sdk";

const result = await executeQuote(client, {
  marketTicker: "will-btc-hit-100k-2026",
  side: "yes",
  collateralUsd: 25,
  leverageBps: 50000, // 5x
  slippageBps: 300,
});

console.log(result.offer.entryPriceUsd);
console.log(result.corrections); // auto-applied adjustments, if any
```

`executeQuote` handles the full lifecycle: creates a draft quote, promotes it, retries on market-moved errors, and auto-corrects parameters when the API suggests adjustments. Hook into each stage:

```typescript
const result = await executeQuote(client, params, {
  onDraftReady: (draft) => showPreview(draft),
  onMarketMoved: (event) => showRetryNotice(event.retryCount),
  onCorrection: (adj) => showAdjustment(adj.field, adj.toLabel),
  maxRetries: 3,
});
```

### Open a position on-chain

```typescript
import { buildCreatePositionTx, buildApproveTx, verifyOfferSignature } from "@dimes-dot-fi/sdk/contract";

// Verify the quote signature
await verifyOfferSignature(client, result.offer, userAddress);

// Build viem-compatible transactions
const approveTx = buildApproveTx(usdcAddress, vaultAddress, amount);
const createTx = buildCreatePositionTx(result.offer);

await walletClient.writeContract(approveTx);
await walletClient.writeContract(createTx);
```

### Close a position

```typescript
import { buildRequestCloseTx } from "@dimes-dot-fi/sdk/contract";

const closeTx = buildRequestCloseTx(vaultAddress, positionKey);
await walletClient.writeContract(closeTx);
```

## React

```tsx
import { DimesClient, JwtAuth } from "@dimes-dot-fi/sdk";
import { DimesProvider } from "@dimes-dot-fi/sdk/react";

const client = new DimesClient({
  auth: new JwtAuth({ tokenUrl: "https://your-backend.com/api/dimes-token" }),
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DimesProvider client={client}>
        <YourApp />
      </DimesProvider>
    </QueryClientProvider>
  );
}
```

All hooks accept optional `queryOptions` for full control over caching, polling, and `queryClient` selection:

```tsx
import { useMarkets, usePositions, useQuote, useContractInfo } from "@dimes-dot-fi/sdk/react";

function Dashboard() {
  const { data: markets } = useMarkets();
  const { data: positions } = usePositions({ status: "open" });
  const { data: contractInfo } = useContractInfo(); // cached, staleTime: Infinity
  const { state, execute, reset } = useQuote();

  // state.phase: "idle" | "loading-draft" | "draft-ready" | "promoting" | "promoted" | "error"
}
```

## Error Handling

```typescript
import { DimesApiError, formatErrorMessage, quoteErrorHint, hintAdjustment } from "@dimes-dot-fi/sdk";

try {
  await executeQuote(client, params);
} catch (err) {
  if (err instanceof DimesApiError) {
    // User-friendly message for any error code
    console.log(formatErrorMessage(err.code, err.params));

    // Programmatic correction hints for leverage/collateral/slippage errors
    const hint = quoteErrorHint(err.code, err.params, { leverageBps: params.leverageBps });
    const adj = hintAdjustment(hint, params);
    if (adj) {
      console.log(`Suggestion: adjust ${adj.field} to ${adj.toLabel}`);
    }
  }
}
```

The SDK's HTTP client automatically retries on 429 (rate limit) with `Retry-After` support and refreshes auth on 401.

## Sandbox

```typescript
const client = new DimesClient({
  baseUrl: "https://api-sandbox.dimes.fi",
  auth: new ApiKeyAuth({
    apiKey: "dm_sbx_skey_...",
    walletAddress: "0x...",
  }),
});
```

Same API, same contracts, fake USDC. Get a sandbox key via the [Telegram link on dimes.fi](https://dimes.fi).

## API Method Reference

| Endpoint | Method | React Hook |
|----------|--------|------------|
| `GET /markets` | `client.getMarkets()` | `useMarkets()` |
| `GET /markets/:ticker` | `client.getMarket(ticker)` | `useMarket(ticker)` |
| `GET /contract-info` | `client.getContractInfo()` | `useContractInfo()` |
| `GET /positions` | `client.getPositions()` | `usePositions()` |
| `GET /limits` | `client.getLimits()` | `useLimits()` |
| `POST /draft-quotes` | `client.createDraftQuote()` | — |
| `POST /promoted-quotes/:id` | `client.promoteDraftQuote()` | — |
| `POST /quotes` | `client.createQuote()` | — |
| Draft → Promote (full flow) | `executeQuote()` | `useQuote()` |
| Cancel position | `client.cancelPosition()` | `useCancelPosition()` |

## Documentation

- [**Quickstart**](https://docs.dimes.fi/for-developers/quickstart) — end-to-end in 6 steps
- [**SDK Installation**](https://docs.dimes.fi/for-developers/sdk-installation) — setup, auth, and peer deps
- [**API Reference**](https://docs.dimes.fi/for-developers/api-reference) — full endpoint documentation
- [**Error Handling**](https://docs.dimes.fi/for-developers/error-handling) — error codes and structured hints
- [**On-Chain Integration**](https://docs.dimes.fi/for-developers/on-chain-integration) — wallet patterns and contract ABIs
- [**UI Guidelines**](https://docs.dimes.fi/for-developers/ui-guidelines) — leverage sliders, quote flow, position cards

## Publishing

```bash
# Bump version, then publish
pnpm version patch   # or minor/major
npm publish --access public
```

The `prepublishOnly` hook runs lint, typecheck, tests, and build before publishing.

## License

[MIT](./LICENSE)
