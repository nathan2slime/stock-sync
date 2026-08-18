import { App as AntdApp } from "antd";
import { useState } from "react";

import {
  productDraftSchema,
  productSchema,
  type ProductDraft,
} from "~/pages/index/schemas";
import { inventoryDb } from "~/database/inventory-db";
import {
  addOptimisticProduct,
  assertProductSkuIsUnique,
  getProductActionErrorMessage,
  type ProductMutationHookParams,
} from "~/pages/index/utils/product-action-helpers";
import { createSyncOperation } from "~/pages/index/utils/sync-operation";

/**
 * Creates products optimistically and queues a local CREATE sync operation.
 *
 * @returns A create mutation and its saving state.
 */
export const useCreateProduct = ({
  products,
  setProducts,
}: ProductMutationHookParams) => {
  const { message } = AntdApp.useApp();
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const createProduct = async (draft: ProductDraft) => {
    setIsCreatingProduct(true);

    try {
      const now = new Date().toISOString();
      const product = productSchema.parse({
        ...productDraftSchema.parse(draft),
        id: crypto.randomUUID(),
        createdAt: now,
        version: 1,
        updatedAt: now,
      });
      const previousProducts = products;

      assertProductSkuIsUnique(product, products);
      setProducts(addOptimisticProduct(products, product));

      try {
        await inventoryDb.operations.add(
          createSyncOperation(product.id, "CREATE", product, now),
        );
      } catch (error) {
        setProducts(previousProducts);
        throw error;
      }

      return product;
    } catch (error) {
      message.error(getProductActionErrorMessage(error));
      return null;
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return {
    createProduct,
    isCreatingProduct,
  };
};
