/**
 * Quote engine — watch the auto-correction and market-moved retry paths.
 *
 * executeQuote handles two kinds of recoverable failure for you:
 *   1. Correctable errors (leverage / collateral / slippage out of range) → it adjusts
 *      the request and retries. `onCorrection` reports each adjustment; return `false`
 *      to abort instead of accepting it.
 *   2. Market-moved errors (price/liquidity shifted between draft and promote) → it
 *      re-drafts and retries up to `maxRetries`. `onMarketMoved` reports each retry;
 *      return `false` to stop.
 *
 * Run:
 *   DIMES_API_KEY=... WALLET_ADDRESS=0x... pnpm tsx examples/02-quote-engine.ts
 */
import { ApiKeyAuth, DimesApiError, DimesClient, executeQuote } from "@dimes-dot-fi/sdk";

const client = new DimesClient({
  baseUrl: process.env.DIMES_BASE_URL ?? "https://api.dimes.fi",
  auth: new ApiKeyAuth({
    apiKey: process.env.DIMES_API_KEY ?? "dm_live_skey_xxx",
    walletAddress: process.env.WALLET_ADDRESS ?? "0x0000000000000000000000000000000000000000",
  }),
});

async function main(): Promise<void> {
  const ticker = process.env.MARKET_TICKER ?? "TRUMP-2024-WIN";

  try {
    const { quote, corrections, retries } = await executeQuote(
      client,
      {
        marketTicker: ticker,
        side: "yes",
        collateralUsd: 100,
        // Deliberately aggressive — likely to be clamped by the risk engine.
        leverageBps: 100_000, // 10x
        slippageBps: 50, // 0.5%
      },
      {
        maxRetries: 3,
        autoCorrect: true,
        onCorrection: (adjustment) => {
          if (adjustment) {
            console.log(`Corrected ${adjustment.field}: ${adjustment.fromValue} → ${adjustment.toLabel}`);
          }
          return true; // return false to reject the correction and throw instead
        },
        onMarketMoved: ({ retryCount }) => {
          console.log(`Market moved — re-drafting (attempt ${retryCount})`);
          return true; // return false to stop retrying
        },
      },
    );

    console.log(`\nFinal quote ${quote.id} — ${retries} retries, ${corrections.length} corrections applied.`);
  } catch (err) {
    // Anything not recoverable surfaces here as a DimesApiError, carrying the API
    // error `code`, a friendly `message`, and a structured `hint` when present.
    if (err instanceof DimesApiError) {
      console.error(`Quote failed [${err.code}]: ${err.message}`, err.hint ?? "");
    } else {
      console.error("Quote failed:", err);
    }
    process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
