import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { CustomerLimit } from "../types";
import { useDimesClient } from "./provider";

/** User trading limits (JWT auth) — `GET /user-limits`. */
export function useUserLimits(queryOptions?: Partial<UseQueryOptions<CustomerLimit>>): UseQueryResult<CustomerLimit> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "user-limits"],
    queryFn: () => client.getUserLimits(),
    ...queryOptions,
  });
}

/** Partner-wide limits (API-key auth) — `GET /partner-limits`. */
export function usePartnerLimits(
  queryOptions?: Partial<UseQueryOptions<CustomerLimit>>,
): UseQueryResult<CustomerLimit> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "partner-limits"],
    queryFn: () => client.getPartnerLimits(),
    ...queryOptions,
  });
}

/** @deprecated Use {@link useUserLimits}. Alias kept for back-compat; resolves to user limits. */
export function useLimits(queryOptions?: Partial<UseQueryOptions<CustomerLimit>>): UseQueryResult<CustomerLimit> {
  return useUserLimits(queryOptions);
}
