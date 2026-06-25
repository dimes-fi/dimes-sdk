import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
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

export function useSearchMarkets(
  params: SearchMarketsParams,
  queryOptions?: Partial<UseQueryOptions<Paginated<Market>>>,
): UseQueryResult<Paginated<Market>> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "markets", "search", params],
    queryFn: () => client.searchMarkets(params),
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
