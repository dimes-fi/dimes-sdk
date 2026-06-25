/**
 * React — provider setup, market list, and a one-click quote.
 *
 * The hooks read the client from `DimesProvider` context and use your existing
 * TanStack Query client. In the browser, authenticate with `JwtAuth` pointed at a
 * backend endpoint that mints short-lived JWTs for the signed-in user — never ship
 * an API key to the client.
 */
import { DimesClient, JwtAuth } from "@dimes-dot-fi/sdk";
import { DimesProvider, useMarkets, useQuote } from "@dimes-dot-fi/sdk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const dimes = new DimesClient({
  auth: new JwtAuth({ tokenUrl: "/api/dimes-token" }),
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DimesProvider client={dimes}>
        <TradePanel />
      </DimesProvider>
    </QueryClientProvider>
  );
}

function TradePanel() {
  const markets = useMarkets({ limit: 10, sort: "depth_desc" });
  const { state, execute } = useQuote();

  if (markets.isLoading) return <p>Loading markets…</p>;

  const market = markets.data?.data[0];
  if (!market) return <p>No markets available.</p>;

  return (
    <div>
      <h2>{market.title ?? market.ticker}</h2>

      <button
        disabled={state.phase === "loading-draft" || state.phase === "promoting"}
        onClick={() =>
          void execute({
            marketTicker: market.ticker,
            side: "yes",
            collateralUsd: 100,
            leverageBps: 20_000, // 2x
            slippageBps: 300, // 3%
          })
        }
      >
        Quote $100 @ 2x YES
      </button>

      <p>Phase: {state.phase}</p>
      {state.corrections.length > 0 && <p>Auto-corrected {state.corrections.length} field(s).</p>}
      {state.quote && <p>Quote {state.quote.id} ready — sign &amp; submit on-chain to open.</p>}
      {state.error != null && <p>Something went wrong. Try again.</p>}
    </div>
  );
}
