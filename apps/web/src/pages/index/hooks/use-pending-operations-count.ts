import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { inventoryDb } from "~/database/inventory-db";
import { pendingSyncStatus } from "~/pages/index/utils/sync-operation";

/**
 * Subscribes to the local pending sync operation count.
 *
 * @returns The number of queued operations still waiting to sync.
 */
export const usePendingOperationsCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const subscription = liveQuery(() =>
      inventoryDb.operations.where("status").equals(pendingSyncStatus).count(),
    ).subscribe({
      next: setCount,
      error: () => {
        setCount(0);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCount]);

  return count;
};
