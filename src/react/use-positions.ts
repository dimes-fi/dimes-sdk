import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { GetPositionsParams } from "../client/dimes-client";
import type { Position } from "../types";
import { useDimesClient } from "./provider";

export function usePositions(
  params?: GetPositionsParams,
  queryOptions?: Partial<UseQueryOptions<Position[]>>,
): UseQueryResult<Position[]> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "positions", params],
    queryFn: () => client.getPositions(params),
    ...queryOptions,
  });
}
