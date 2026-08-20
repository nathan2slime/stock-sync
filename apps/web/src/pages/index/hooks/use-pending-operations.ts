import { App as AntdApp } from "antd";
import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { inventoryDb } from "~/database/inventory-db";
import type { SyncOperation } from "~/pages/index/schemas";
import { pendingSyncStatus } from "~/pages/index/utils/sync-operation";

type PendingOperationsState = {
  data: SyncOperation[];
  error: string | null;
  isLoading: boolean;
  total: number;
};

export type PendingOperationsPagination = {
  page: number;
  perPage: number;
};

export const defaultPendingOperationsPagination = {
  page: 1,
  perPage: 10,
} satisfies PendingOperationsPagination;

const getPendingOperationsErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return "We could not load the changes saved on this device. Please try again.";
  }

  return "We could not load the changes saved on this device. Please try again.";
};

export const usePendingOperations = (
  pagination: PendingOperationsPagination = { page: 1, perPage: 10 },
) => {
  const { message } = AntdApp.useApp();
  const page = pagination.page;
  const perPage = pagination.perPage;
  const [state, setState] = useState<PendingOperationsState>({
    data: [],
    error: null,
    isLoading: true,
    total: 0,
  });

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const operations = await inventoryDb.operations
        .where("status")
        .equals(pendingSyncStatus)
        .sortBy("createdAt");
      const total = operations.length;

      if (!page || !perPage) {
        return { data: operations, total };
      }

      const start = (page - 1) * perPage;

      return { data: operations.slice(start, start + perPage), total };
    }).subscribe({
      next: ({ data, total }) => {
        setState({ data, error: null, isLoading: false, total });
      },
      error: (error) => {
        const errorMessage = getPendingOperationsErrorMessage(error);

        message.error(errorMessage);
        setState({ data: [], error: errorMessage, isLoading: false, total: 0 });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [message, page, perPage, setState]);

  return state;
};
