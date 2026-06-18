# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

TypeScript SDK (`@dimes-dot-fi/sdk`) for the Dimes prediction market API. Provides an HTTP client, a high-level quote engine with auto-correction, React hooks, and on-chain transaction builders.

## Commands

- `pnpm build` — build with tsup (ESM + CJS, three entry points)
- `pnpm test` — run all tests with vitest
- `pnpm test -- tests/quote.test.ts` — run a single test file
- `pnpm typecheck` — type-check without emitting
- `pnpm lint` — run eslint + prettier check
- `pnpm lint:fix` — auto-fix eslint + prettier
- `pnpm format` — format with prettier
- `pnpm knip` — check for unused exports/dependencies
- `pnpm generate:types` — regenerate `src/types/generated.ts` from the OpenAPI spec (requires sibling `../api-ccotg-epic` repo)

## Architecture

**Three package entry points** (configured in tsup.config.ts and package.json exports):
- `@dimes-dot-fi/sdk` — core client, quote engine, error types, domain types
- `@dimes-dot-fi/sdk/react` — React hooks + context provider (peer deps: react, @tanstack/react-query)
- `@dimes-dot-fi/sdk/contract` — on-chain tx builders and signature verification (peer dep: viem)

**API type pipeline**: OpenAPI spec → `scripts/generate-types.ts` → `src/types/generated.ts` (raw snake_case) → `src/types/aliases.ts` (camelized via `CamelizeKeys<T>`). The runtime also camelizes/decamelizes JSON through the `humps` library in `HttpClient`.

**Quote engine** (`src/quote/quote.ts`): orchestrates a draft-quote → promote flow with two retry paths:
1. Market-moved errors trigger re-draft + promote retry (up to `maxRetries`)
2. Correctable errors (leverage/collateral/slippage limits) trigger auto-adjustment via `quoteErrorHint` → `hintAdjustment`, then a direct `createQuote` call (bypassing the draft step)

Both retry paths can be aborted by returning `false` from the `onMarketMoved` / `onCorrection` callbacks.

**Auth**: Two `AuthProvider` implementations — `ApiKeyAuth` (exchanges API key + wallet for JWT, auto-refreshes) and `JwtAuth` (static or dynamic token). `HttpClient` retries once on 401 if the provider supports `refresh()`.

**Contract verification**: `verifyOfferSignature()` recovers the EIP-712 signer from an offer and validates it against the `/contract-info` endpoint (cached per-client via WeakMap).

**Shared utilities**: `src/utils/` contains number parsing (`asNumber`, `asBigInt`) and display formatting (`formatPipsUsd`, `formatLeverage`, `formatBpsPct`, `formatFractionPct`) used by both error messages and quote error hints.

## Releasing

Requires a **classic automation token** from npmjs.com (Access Tokens → Classic Token → Automation). Granular tokens don't work reliably with org-scoped packages.

```bash
# Build + publish manually
pnpm build
npm publish --access public --registry https://registry.npmjs.org/ \
  --//registry.npmjs.org/:_authToken=YOUR_TOKEN

# Or bump version first
pnpm version patch   # or minor / major
npm publish --access public --registry https://registry.npmjs.org/ \
  --//registry.npmjs.org/:_authToken=YOUR_TOKEN
```

The `prepublishOnly` hook runs lint, typecheck, tests, and build before publishing — if any step fails, the publish is aborted.
