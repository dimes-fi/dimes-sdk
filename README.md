<p align="center">
  <strong>@dimes-dot-fi/sdk</strong>
</p>

<p align="center">
  TypeScript SDK for building on <a href="https://dimes.fi">Dimes Multiply</a> — leveraged prediction markets.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dimes-dot-fi/sdk"><img src="https://img.shields.io/npm/v/@dimes-dot-fi/sdk.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@dimes-dot-fi/sdk"><img src="https://img.shields.io/npm/dm/@dimes-dot-fi/sdk.svg" alt="npm downloads"></a>
  <a href="https://github.com/dimes-fi/dimes-sdk/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
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

// Narrow to one event (a single game or price window) or one series (the recurring
// template those events come from). Same params and same market objects as getMarkets.
const { data: gameMarkets } = await client.getEventMarkets("nba-lal-bos-2026-08-06");
const { data: seriesMarkets } = await client.getSeriesMarkets("btc-up-or-down-5m");
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

console.log(result.quote.entryPriceUsd);
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

**Always verify the quote's signature before submitting.** The quote is signed by
the Dimes authority over every term (size, leverage, fees, expiry); the vault
enforces it on-chain (`InvalidSignature` / `SignatureExpired`), so verifying
client-side just lets a tampered or stale quote fail fast instead of reverting.

#### Recommended (mirrors the [dimes-demo-ui](https://github.com/dimes-fi/dimes-demo-ui) demo)

Fetch `contract-info` once (it's cached), check the recovered signer with
`assertQuoteSigner`, then build and submit the tx however your wallet stack
requires. This keeps full control of your own UX and tx path while the SDK owns
the crypto:

```typescript
import {
  assertQuoteSigner,
  resolveExpectedSigner,
  getCachedContractInfo,
  buildApproveTx,
  buildCreatePositionTx,
} from "@dimes-dot-fi/sdk/contract";
import { getAddress } from "viem";

const quote = result.quote;

// The signed `user` is bound to msg.sender on-chain, so the submitting wallet
// must be the one the quote was created for.
const user = getAddress(quote.authorityPublicKey);
if (getAddress(walletAddress) !== user) throw new Error("Wrong wallet for this quote.");

// contract-info is cached per-client (staleTime: Infinity in React via useContractInfo()).
const { polygonSignerAddress } = await getCachedContractInfo(client);
const expectedSigner = resolveExpectedSigner(polygonSignerAddress);
if (!expectedSigner) throw new Error("No signer address from /contract-info.");

// Recover + compare. Throws DimesContractError("invalid_signer") on mismatch.
await assertQuoteSigner(quote, user, expectedSigner);

// Build viem-compatible transactions and submit them your way.
const approveTx = buildApproveTx(usdcAddress, vaultAddress, BigInt(quote.totalUserAmountUsdcUnits));
const createTx = buildCreatePositionTx(quote);
await walletClient.writeContract(approveTx);
await walletClient.writeContract(createTx);
```

`buildCreatePositionTx` and `buildPushFundedCreateCalls` pick the vault function from the quote:
`riskMode` chooses between the plain and `...WithMargin` calls, and `polymarketProtocolVersion` 2
(a Polymarket Protocol V2 market) chooses their `...WithVersion` / `...WithMarginAndVersion` twins.
`isCommittedQuote(quote)` and `isProtocolV2Quote(quote)` expose the same two decisions if you
encode the call yourself; a signature only verifies against the function it was issued for.

#### Primitives (build it differently)

- `recoverCreatePositionSigner(quote, user)` — pure EIP-712 recovery; compare the
  returned address yourself.
- `buildCreatePositionTx`, `buildApproveTx`, `buildRequestCloseTx`,
  `buildPushFundedCreateCalls`, `buildDepositWalletBatch` — raw call/tx builders
  for EOA, smart-wallet (ERC-4337) batching, or deposit-wallet relayer flows. See
  the three create-position hooks in dimes-ui for worked examples of each.

#### Headless one-liners (no custom UX needed)

For a bot or server that holds a `DimesClient` and doesn't need bespoke checks,
these verify against the client's cached `contract-info` for you:

```typescript
import { buildVerifiedCreatePositionTx, buildVerifiedPushFundedCreateCalls } from "@dimes-dot-fi/sdk/contract";

// verify-then-build in one call (throws on a bad signature):
const createTx = await buildVerifiedCreatePositionTx(client, quote, user);
const calls = await buildVerifiedPushFundedCreateCalls(client, quote, depositWallet); // pUSD address from contract-info
```

`verifyQuoteSignature(client, quote, user)` is the standalone verify if you want
to build separately. (`verifyOfferSignature` is a deprecated alias.)

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
| `GET /events/:eventTicker/markets` | `client.getEventMarkets(eventTicker)` | — |
| `GET /series/:seriesTicker/markets` | `client.getSeriesMarkets(seriesTicker)` | — |
| `GET /contract-info` | `client.getContractInfo()` | `useContractInfo()` |
| `GET /positions` | `client.getPositions()` | `usePositions()` |
| `GET /markets/:ticker/positions` | `client.getMarketPositions(ticker)` | — |
| `GET /events/:eventTicker/positions` | `client.getEventPositions(eventTicker)` | — |
| `GET /series/:seriesTicker/positions` | `client.getSeriesPositions(seriesTicker)` | — |
| `GET /user-limits` | `client.getUserLimits()` | `useUserLimits()` |
| `GET /partner-limits` | `client.getPartnerLimits()` | `usePartnerLimits()` |
| `POST /draft-quotes` | `client.createDraftQuote()` | — |
| `POST /promoted-quotes/:id` | `client.promoteDraftQuote()` | — |
| `POST /quotes` | `client.createQuote()` | — |
| Draft → Promote (full flow) | `executeQuote()` | `useQuote()` |
| Cancel position | `client.cancelPosition()` | `useCancelPosition()` |

## Examples

Runnable, type-checked examples live in [`examples/`](examples) — they're verified
against the SDK source in CI (`pnpm examples:typecheck`), so they never drift from
the real API:

| File | Shows |
| --- | --- |
| [`01-quickstart.ts`](examples/01-quickstart.ts) | Auth, list markets, fetch an executable quote |
| [`02-quote-engine.ts`](examples/02-quote-engine.ts) | `executeQuote` auto-correction + market-moved retries |
| [`03-open-position-onchain.ts`](examples/03-open-position-onchain.ts) | EOA flow: approve → verify signature → `createPosition` (viem) |
| [`04-positions-and-close.ts`](examples/04-positions-and-close.ts) | List positions, request an on-chain close |
| [`05-websocket.ts`](examples/05-websocket.ts) | Stream live position events over Socket.IO |
| [`react/trade-panel.tsx`](examples/react/trade-panel.tsx) | Provider + `useMarkets` + `useQuote` |
| [`react/streams.tsx`](examples/react/streams.tsx) | `usePositions` with live WebSocket reconciliation |

## Documentation

- [**Quickstart**](https://docs.dimes.fi/for-developers/quickstart) — end-to-end in 6 steps
- [**SDK Installation**](https://docs.dimes.fi/for-developers/sdk-installation) — setup, auth, and peer deps
- [**React Hooks**](https://docs.dimes.fi/for-developers/react-hooks) — provider, data hooks, quote state machine
- [**WebSocket Events**](https://docs.dimes.fi/for-developers/websocket) — live position & market streams
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
