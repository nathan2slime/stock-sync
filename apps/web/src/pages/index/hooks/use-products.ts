import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  defaultProductQueryParams,
  productQueryOptions,
} from "~/api/queries/product.query";
import type { ProductQueryParams } from "~/api/types/product";
import type { Product } from "~/pages/index/schemas";
import { usePendingOperations } from "~/pages/index/hooks/use-pending-operations";
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

  return "We could not load your products right now.";
};

/**
 * Loads service products, overlays locally queued operations, and exposes the product list.
 *
 * @returns Product data, hydration state, and the product state setter for optimistic mutations.
 */
export const useProducts = () => {
  const [productQueryParams, setProductQueryParams] = useState(
    defaultProductQueryParams,
  );
  const productsQuery = useQuery(productQueryOptions(productQueryParams));
  const pendingOperations = usePendingOperations();
  const productsErrorMessage = productsQuery.error
    ? getReadErrorMessage(productsQuery.error)
    : null;
  const [state, setState] = useState<ProductsHydrationState>({
    error: null,
    isLoading: true,
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const remoteProducts = productsQuery.data?.data ?? [];

    setProducts(
      getProductsFromOperations(pendingOperations.data, remoteProducts),
    );
    setState({
      error: productsErrorMessage ?? pendingOperations.error,
      isLoading: productsQuery.isLoading || pendingOperations.isLoading,
    });
  }, [
    pendingOperations,
    productsErrorMessage,
    productsQuery.data,
    productsQuery.isLoading,
    setProducts,
    setState,
  ]);

  const productPagination = {
    page: productQueryParams.page,
    perPage: productQueryParams.perPage,
    total: Math.max(productsQuery.data?.total ?? 0, products.length),
  };

  const setProductPagination = (pagination: ProductQueryParams) => {
    setProductQueryParams(pagination);
  };

  return {
    ...state,
    data: products,
    isPendingOperationsLoading: pendingOperations.isLoading,
    pendingOperations: pendingOperations.data,
    productPagination,
    setProducts,
    setProductPagination,
  };
};
