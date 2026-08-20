import { App as AntdApp } from "antd";
import { useState } from "react";

import { deleteProductMutationFn } from "~/api/mutations/product.mutation";
import { queryClient } from "~/api";
import { inventoryDb } from "~/database/inventory-db";
import {
  getProductActionErrorMessage,
  getRequiredProduct,
  pendingProductOperationSavedMessage,
  removeOptimisticProduct,
  type ProductMutationHookParams,
} from "~/pages/index/utils/product-action-helpers";
import {
  createSyncOperation,
  pendingSyncStatus,
} from "~/pages/index/utils/sync-operation";

const isQueuedCreateOrUpdateOperation = (operation: {
  status: string;
  type: string;
}) =>
  operation.status === pendingSyncStatus &&
  (operation.type === "CREATE" || operation.type === "UPDATE");

const replaceQueuedProductOperationsWithDelete = async (
  id: string,
  createdAt: string,
) => {
  const persistDeletedProduct = async () => {
    const queuedOperationIds = await inventoryDb.operations
      .where("entityId")
      .equals(id)
      .filter(isQueuedCreateOrUpdateOperation)
      .primaryKeys();

    await inventoryDb.operations.bulkDelete(queuedOperationIds);
    await inventoryDb.operations.add(
      createSyncOperation(id, "DELETE", { id }, createdAt),
    );
  };

  await inventoryDb.transaction(
    "rw",
    inventoryDb.operations,
    persistDeletedProduct,
  );
};

/**
 * Deletes products remotely, falling back to a queued local DELETE sync operation.
 *
 * @returns A delete mutation and its saving state.
 */
export const useDeleteProduct = ({
  products,
  setProducts,
}: ProductMutationHookParams) => {
  const { message } = AntdApp.useApp();
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const deleteProduct = async (id: string) => {
    setIsDeletingProduct(true);

    try {
      const existingProduct = getRequiredProduct(products, id);
      const previousProducts = products;
      const now = new Date().toISOString();

      try {
        await deleteProductMutationFn(id);
        setProducts(removeOptimisticProduct(products, id));
        void queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch {
        setProducts(removeOptimisticProduct(products, id));

        try {
          await replaceQueuedProductOperationsWithDelete(id, now);
          message.warning(pendingProductOperationSavedMessage);
        } catch (error) {
          setProducts(previousProducts);
          throw error;
        }
      }

      return existingProduct;
    } catch (error) {
      message.error(getProductActionErrorMessage(error));
      return null;
    } finally {
      setIsDeletingProduct(false);
    }
  };

  return {
    deleteProduct,
    isDeletingProduct,
  };
};
