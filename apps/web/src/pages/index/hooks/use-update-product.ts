import { App as AntdApp } from "antd";
import { useState } from "react";

import { updateProductMutationFn } from "~/api/mutations/product.mutation";
import { queryClient } from "~/api";
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
  pendingProductOperationSavedMessage,
  replaceOptimisticProduct,
  type ProductMutationHookParams,
} from "~/pages/index/utils/product-action-helpers";
import { createSyncOperation } from "~/pages/index/utils/sync-operation";

/**
 * Updates products remotely, falling back to a queued local UPDATE sync operation.
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
      const parsedDraft = productDraftSchema.parse(draft);
      const now = new Date().toISOString();
      const fallbackProduct = productSchema.parse({
        ...existingProduct,
        ...parsedDraft,
        version: existingProduct.version + 1,
        updatedAt: now,
      });
      const previousProducts = products;

      assertProductSkuIsUnique(fallbackProduct, products);

      try {
        const product = await updateProductMutationFn(id, parsedDraft);

        setProducts(replaceOptimisticProduct(products, product));
        void queryClient.invalidateQueries({ queryKey: ["products"] });

        return product;
      } catch {
        setProducts(replaceOptimisticProduct(products, fallbackProduct));

        try {
          await inventoryDb.operations.add(
            createSyncOperation(
              fallbackProduct.id,
              "UPDATE",
              fallbackProduct,
              now,
            ),
          );
          message.warning(pendingProductOperationSavedMessage);
        } catch (error) {
          setProducts(previousProducts);
          throw error;
        }
      }

      return fallbackProduct;
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
