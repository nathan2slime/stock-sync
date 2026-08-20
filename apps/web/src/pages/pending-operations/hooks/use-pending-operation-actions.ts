import { App as AntdApp } from "antd";
import { isAxiosError } from "axios";
import { useState } from "react";

import { api, queryClient } from "~/api";
import { inventoryDb } from "~/database/inventory-db";
import type { Product, SyncOperation } from "~/pages/index/schemas";

const excludeOperationErrorMessage =
  "We could not remove the selected operation. Please try again";
const executeOperationErrorMessage =
  "We could not send the selected operation. It is still saved, so you can try again later";

const getProductDraftPayload = (product: Product) => ({
  name: product.name,
  quantity: product.quantity,
  sku: product.sku,
});

const executePendingOperation = async (operation: SyncOperation) => {
  if (operation.type === "CREATE") {
    await api.post(
      "/products/create",
      getProductDraftPayload(operation.payload),
    );
    return;
  }

  if (operation.type === "UPDATE") {
    await api.put(
      `/products/update/${operation.entityId}`,
      getProductDraftPayload(operation.payload),
    );
    return;
  }

  await api.delete(`/products/delete/${operation.entityId}`);
};

const getOperationActionSuccessMessage = (count: number, action: string) => {
  if (count === 1) {
    return `Operation ${action}.`;
  }

  return `${count} operations ${action}.`;
};

const getOperationIds = (operations: SyncOperation[]) =>
  operations.map((operation) => operation.id);

export const usePendingOperationActions = () => {
  const { message } = AntdApp.useApp();
  const [processingOperationIds, setProcessingOperationIds] = useState<
    string[]
  >([]);

  const trackProcessing = async (
    operationIds: string[],
    action: () => Promise<void>,
    errorMessage: string,
  ) => {
    setProcessingOperationIds((ids) => [...new Set([...ids, ...operationIds])]);

    try {
      await action();
      return true;
    } catch (error) {
      if (!isAxiosError(error)) {
        message.error(errorMessage);
      }

      return false;
    } finally {
      setProcessingOperationIds((ids) =>
        ids.filter((id) => !operationIds.includes(id)),
      );
    }
  };

  const excludeOperations = async (operations: SyncOperation[]) => {
    const operationIds = getOperationIds(operations);

    if (operationIds.length === 0) {
      return false;
    }

    const succeeded = await trackProcessing(
      operationIds,
      async () => {
        await inventoryDb.operations.bulkDelete(operationIds);
      },
      excludeOperationErrorMessage,
    );

    if (succeeded) {
      message.success(
        getOperationActionSuccessMessage(operationIds.length, "excluded"),
      );
    }

    return succeeded;
  };

  const executeOperations = async (operations: SyncOperation[]) => {
    const operationIds = getOperationIds(operations);

    if (operationIds.length === 0) {
      return false;
    }

    let hasExecutedOperation = false;
    const succeeded = await trackProcessing(
      operationIds,
      async () => {
        try {
          for (const operation of operations) {
            await executePendingOperation(operation);
            await inventoryDb.operations.delete(operation.id);
            hasExecutedOperation = true;
          }
        } finally {
          if (hasExecutedOperation) {
            void queryClient.invalidateQueries({ queryKey: ["products"] });
          }
        }
      },
      executeOperationErrorMessage,
    );

    if (succeeded) {
      message.success(
        getOperationActionSuccessMessage(operationIds.length, "executed"),
      );
    }

    return succeeded;
  };

  return {
    excludeOperations,
    executeOperations,
    isProcessingOperations: processingOperationIds.length > 0,
    processingOperationIds,
  };
};
