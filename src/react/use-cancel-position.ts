import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { useDimesClient } from "./provider";

export function useCancelPosition(
  mutationOptions?: Partial<UseMutationOptions<void, Error, string>>,
): UseMutationResult<void, Error, string> {
  const client = useDimesClient();

  return useMutation({
    mutationFn: (positionId: string) => client.cancelPosition(positionId),
    ...mutationOptions,
  });
}
