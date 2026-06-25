# Examples

Runnable examples for [`@dimes-dot-fi/sdk`](../README.md). Every file here is
type-checked against the SDK source in CI (`pnpm examples:typecheck`), so the
snippets in the [docs](https://docs.dimes.fi/for-developers) never drift from the
real API.

| File | Entry point | Shows |
| --- | --- | --- |
| [`01-quickstart.ts`](01-quickstart.ts) | `@dimes-dot-fi/sdk` | Auth, list markets, fetch an executable quote |
| [`02-quote-engine.ts`](02-quote-engine.ts) | `@dimes-dot-fi/sdk` | `executeQuote` auto-correction + market-moved retries |
| [`03-open-position-onchain.ts`](03-open-position-onchain.ts) | `@dimes-dot-fi/sdk/contract` | EOA flow: approve → verify signature → `createPosition` (viem) |
| [`04-positions-and-close.ts`](04-positions-and-close.ts) | `@dimes-dot-fi/sdk/contract` | List positions, request an on-chain close |
| [`05-websocket.ts`](05-websocket.ts) | `@dimes-dot-fi/sdk/ws` | Stream live position events over Socket.IO |
| [`react/trade-panel.tsx`](react/trade-panel.tsx) | `@dimes-dot-fi/sdk/react` | Provider + `useMarkets` + `useQuote` |
| [`react/streams.tsx`](react/streams.tsx) | `@dimes-dot-fi/sdk/react` | `usePositions` with live WebSocket reconciliation |

## Running

From the repo root:

```bash
pnpm install
# Node examples (need credentials):
DIMES_API_KEY=dm_live_skey_... WALLET_ADDRESS=0x... pnpm tsx examples/01-quickstart.ts
```

The on-chain examples (`03`, `04`) send real transactions — point them at the
sandbox and use test funds (`PRIVATE_KEY`, optional `RPC_URL`, `DIMES_BASE_URL`).

The React files (`react/*.tsx`) are illustrative components — drop them into your
own app; they aren't standalone entry points.

## Auth note

`ApiKeyAuth` is **server-side only** — it exchanges your API key for a JWT and must
never run in a browser. In a frontend, use `JwtAuth` pointed at a backend endpoint
that mints short-lived JWTs for the signed-in user.
