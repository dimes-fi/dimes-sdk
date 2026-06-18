import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { CustomerLimit } from "../types";
import { useDimesClient } from "./provider";

export function useLimits(queryOptions?: Partial<UseQueryOptions<CustomerLimit>>): UseQueryResult<CustomerLimit> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "limits"],
    queryFn: () => client.getLimits(),
    ...queryOptions,
  });
}
