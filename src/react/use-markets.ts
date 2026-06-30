import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
// eslint-disable-next-line import-x/no-deprecated -- SearchMarketsParams imported for the deprecated shim below
import type { GetMarketsParams, SearchMarketsParams } from "../client/dimes-client";
import type { Market, Paginated } from "../types";
import { useDimesClient } from "./provider";

export function useMarkets(
  params?: GetMarketsParams,
  queryOptions?: Partial<UseQueryOptions<Paginated<Market>>>,
): UseQueryResult<Paginated<Market>> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "markets", params],
    queryFn: () => client.getMarkets(params),
    ...queryOptions,
  });
}

/**
 * @deprecated Use {@link useMarkets} with a `query` param: `useMarkets({ query })`.
 * Search is now served by `GET /markets?query=` instead of the deprecated `/markets/search` path.
 */
export function useSearchMarkets(
  // eslint-disable-next-line @typescript-eslint/no-deprecated, import-x/no-deprecated -- this IS the deprecated hook
  params: SearchMarketsParams,
  queryOptions?: Partial<UseQueryOptions<Paginated<Market>>>,
): UseQueryResult<Paginated<Market>> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "markets", "search", params],
    queryFn: () => client.getMarkets(params),
    enabled: !!params.query,
    ...queryOptions,
  });
}

export function useMarket(ticker: string, queryOptions?: Partial<UseQueryOptions<Market>>): UseQueryResult<Market> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "market", ticker],
    queryFn: () => client.getMarket(ticker),
    enabled: !!ticker,
    ...queryOptions,
  });
}
