import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { PositionPartialCloseList } from "../types";
import { useDimesClient } from "./provider";

export function usePositionPartialCloses(
  positionId: string | null | undefined,
  queryOptions?: Partial<UseQueryOptions<PositionPartialCloseList>>,
): UseQueryResult<PositionPartialCloseList> {
  const client = useDimesClient();

  return useQuery({
    queryKey: ["dimes", "positionPartialCloses", positionId],
    queryFn: () => {
      if (positionId == null) {
        return Promise.reject(new Error("positionId is required"));
      }
      return client.getPositionPartialCloses(positionId);
    },
    enabled: Boolean(positionId),
    ...queryOptions,
  });
}
