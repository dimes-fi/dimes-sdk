/**
 * Quickstart — authenticate, list markets, and fetch an executable quote.
 *
 * Run:
 *   DIMES_API_KEY=dm_live_skey_... WALLET_ADDRESS=0x... pnpm tsx examples/01-quickstart.ts
 *
 * `ApiKeyAuth` is server-side only — it exchanges your API key for a JWT and must
 * never run in a browser. In a frontend, use `JwtAuth` pointed at a backend endpoint
 * that mints JWTs for your users (see examples/react/trade-panel.tsx).
 */
import { ApiKeyAuth, DimesClient, executeQuote } from "@dimes-dot-fi/sdk";

const client = new DimesClient({
  // Defaults to production; point at the sandbox while testing.
  baseUrl: process.env.DIMES_BASE_URL ?? "https://api.dimes.fi",
  auth: new ApiKeyAuth({
    apiKey: process.env.DIMES_API_KEY ?? "dm_live_skey_xxx",
    walletAddress: process.env.WALLET_ADDRESS ?? "0x0000000000000000000000000000000000000000",
  }),
});

async function main(): Promise<void> {
  // 1. List the deepest markets currently accepting positions.
  const markets = await client.getMarkets({ limit: 5, sort: "depth_desc" });
  for (const market of markets.data) {
    console.log(`${market.ticker} — ${market.title ?? "(untitled)"}`);
  }

  const first = markets.data[0];
  if (!first) {
    console.log("No markets available.");
    return;
  }

  // 2. Get an executable quote for $100 at 2x on the YES side.
  //    executeQuote runs the draft → promote flow and auto-corrects
  //    leverage / collateral / slippage when the API rejects the request.
  const { quote, corrections, retries } = await executeQuote(client, {
    marketTicker: first.ticker,
    side: "yes",
    collateralUsd: 100,
    leverageBps: 20_000, // 2x  (10_000 = 1x)
    slippageBps: 300, // 3%
  });

  console.log(`\nQuote ${quote.id} ready — retries: ${retries}, corrections: ${corrections.length}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
