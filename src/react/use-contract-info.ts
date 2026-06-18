import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { ContractInfo } from "../types";
import { useDimesClient } from "./provider";

export function useContractInfo(queryOptions?: Partial<UseQueryOptions<ContractInfo>>): UseQueryResult<ContractInfo> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "contractInfo"],
    queryFn: () => client.getContractInfo(),
    staleTime: Infinity,
    ...queryOptions,
  });
}
