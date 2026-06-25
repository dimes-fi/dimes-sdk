import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { DimesApiError } from "../errors/dimes-error";
import { useDimesClient } from "./provider";

const HTTP_CONFLICT = 409;

export type CancelPositionResult = "cancelled" | "already_cancelling";

export interface UseCancelPositionOptions {
  /**
   * Treat a 409 Conflict (the position is already being cancelled) as success, resolving to
   * `"already_cancelling"` instead of throwing. Default false — a 409 rejects like any other error.
   */
  treatConflictAsAlreadyCancelling?: boolean;
}

export function useCancelPosition(
  mutationOptions?: Partial<UseMutationOptions<CancelPositionResult, Error, string>>,
  options?: UseCancelPositionOptions,
): UseMutationResult<CancelPositionResult, Error, string> {
  const client = useDimesClient();
  const treatConflictAsAlreadyCancelling = options?.treatConflictAsAlreadyCancelling ?? false;

  return useMutation({
    mutationFn: async (positionId: string): Promise<CancelPositionResult> => {
      try {
        await client.cancelPosition(positionId);
        return "cancelled";
      } catch (err) {
        if (treatConflictAsAlreadyCancelling && err instanceof DimesApiError && err.status === HTTP_CONFLICT) {
          return "already_cancelling";
        }
        throw err;
      }
    },
    ...mutationOptions,
  });
}
