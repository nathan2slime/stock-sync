import { App as AntdApp } from "antd";
import { useState } from "react";

import { createProductMutationFn } from "~/api/mutations/product.mutation";
import { queryClient } from "~/api";
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
  pendingProductOperationSavedMessage,
  type ProductMutationHookParams,
} from "~/pages/index/utils/product-action-helpers";
import { createSyncOperation } from "~/pages/index/utils/sync-operation";

/**
 * Creates products remotely, falling back to a queued local CREATE sync operation.
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
      const parsedDraft = productDraftSchema.parse(draft);
      const now = new Date().toISOString();
      const fallbackProduct = productSchema.parse({
        ...parsedDraft,
        id: crypto.randomUUID(),
        createdAt: now,
        version: 1,
        updatedAt: now,
      });
      const previousProducts = products;

      assertProductSkuIsUnique(fallbackProduct, products);

      try {
        const product = await createProductMutationFn(parsedDraft);

        setProducts(addOptimisticProduct(products, product));
        void queryClient.invalidateQueries({ queryKey: ["products"] });

        return product;
      } catch {
        setProducts(addOptimisticProduct(products, fallbackProduct));

        try {
          await inventoryDb.operations.add(
            createSyncOperation(
              fallbackProduct.id,
              "CREATE",
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
      setIsCreatingProduct(false);
    }
  };

  return {
    createProduct,
    isCreatingProduct,
  };
};
