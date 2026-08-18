import { App as AntdApp } from "antd";
import { useEffect, useState } from "react";

import type { Product } from "~/pages/index/schemas";
import { inventoryDb } from "~/database/inventory-db";
import { getProductsFromOperations } from "~/pages/index/utils/products-from-operations";

/**
 * Tracks the initial local product read lifecycle for the inventory view.
 */
type ProductsHydrationState = {
  error: string | null;
  isLoading: boolean;
};

const getReadErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not read the local inventory";
};

const getStoredProducts = async () => {
  const operations = await inventoryDb.operations
    .orderBy("createdAt")
    .toArray();

  return getProductsFromOperations(operations);
};

/**
 * Loads locally queued product operations and exposes the derived product list.
 *
 * @returns Product data, hydration state, and the product state setter for optimistic mutations.
 */
export const useProducts = () => {
  const { message } = AntdApp.useApp();
  const [state, setState] = useState<ProductsHydrationState>({
    error: null,
    isLoading: true,
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadStoredProducts = async () => {
      try {
        const storedProducts = await getStoredProducts();

        setProducts(storedProducts);
        setState({ error: null, isLoading: false });
      } catch (error) {
        const errorMessage = getReadErrorMessage(error);

        message.error(errorMessage);
        setState({
          error: errorMessage,
          isLoading: false,
        });
      }
    };

    void loadStoredProducts();
  }, [message, setProducts, setState]);

  return {
    ...state,
    data: products,
    setProducts,
  };
};
