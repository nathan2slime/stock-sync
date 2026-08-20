import { usePendingOperations } from "~/pages/index/hooks/use-pending-operations";

/**
 * Subscribes to the local pending sync operation count.
 *
 * @returns The number of queued operations still waiting to sync.
 */
export const usePendingOperationsCount = () => {
  const pendingOperations = usePendingOperations();

  return pendingOperations.data.length;
};
