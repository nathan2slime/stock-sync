import { queryOptions } from "@tanstack/react-query";

import { api } from "~/api";
import { productListResponseSchema } from "~/api/schemas/product";
import type {
  ProductListResponse,
  ProductQueryParams,
} from "~/api/types/product";

export const defaultProductQueryParams = {
  page: 1,
  perPage: 10,
} satisfies ProductQueryParams;

export const productQueryKey = (
  params: ProductQueryParams = defaultProductQueryParams,
) => ["products", params] as const;

export const productQueryFn = async (
  params: ProductQueryParams = defaultProductQueryParams,
) => {
  const response = await api.get<ProductListResponse>("/products/paginate", {
    params,
  });

  return productListResponseSchema.parse(response.data);
};

export const productQueryOptions = (
  params: ProductQueryParams = defaultProductQueryParams,
) =>
  queryOptions({
    queryFn: () => productQueryFn(params),
    queryKey: productQueryKey(params),
    retry: false,
  });
