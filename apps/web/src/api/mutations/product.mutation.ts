import { api } from "~/api";
import { productResponseSchema } from "~/api/schemas/product";
import type { ProductItem } from "~/api/types/product";
import type { Product, ProductDraft } from "~/pages/index/schemas";

const getProductDraftPayload = (product: ProductDraft) => ({
  name: product.name,
  quantity: product.quantity,
  sku: product.sku,
});

export const createProductMutationFn = async (product: ProductDraft) => {
  const response = await api.post<ProductItem>(
    "/products/create",
    getProductDraftPayload(product),
  );

  return productResponseSchema.parse(response.data);
};

export const updateProductMutationFn = async (
  id: Product["id"],
  product: ProductDraft,
) => {
  const response = await api.put<ProductItem>(
    `/products/update/${id}`,
    getProductDraftPayload(product),
  );

  return productResponseSchema.parse(response.data);
};

export const deleteProductMutationFn = async (id: Product["id"]) => {
  await api.delete(`/products/delete/${id}`);
};
