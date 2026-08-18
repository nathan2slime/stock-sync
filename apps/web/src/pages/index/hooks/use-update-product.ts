import { App as AntdApp } from "antd";
import { useState } from "react";

import {
  productDraftSchema,
  productSchema,
  type ProductDraft,
} from "~/pages/index/schemas";
import { inventoryDb } from "~/database/inventory-db";
import {
  assertProductSkuIsUnique,
  getProductActionErrorMessage,
  getRequiredProduct,
  replaceOptimisticProduct,
  type ProductMutationHookParams,
} from "~/pages/index/utils/product-action-helpers";
import { createSyncOperation } from "~/pages/index/utils/sync-operation";

/**
 * Updates products optimistically and queues a local UPDATE sync operation.
 *
 * @returns An update mutation and its saving state.
 */
export const useUpdateProduct = ({
  products,
  setProducts,
}: ProductMutationHookParams) => {
  const { message } = AntdApp.useApp();
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  const updateProduct = async (id: string, draft: ProductDraft) => {
    setIsUpdatingProduct(true);

    try {
      const existingProduct = getRequiredProduct(products, id);
      const now = new Date().toISOString();
      const product = productSchema.parse({
        ...existingProduct,
        ...productDraftSchema.parse(draft),
        version: existingProduct.version + 1,
        updatedAt: now,
      });
      const previousProducts = products;

      assertProductSkuIsUnique(product, products);
      setProducts(replaceOptimisticProduct(products, product));

      try {
        await inventoryDb.operations.add(
          createSyncOperation(product.id, "UPDATE", product, now),
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
      setIsUpdatingProduct(false);
    }
  };

  return {
    isUpdatingProduct,
    updateProduct,
  };
};
