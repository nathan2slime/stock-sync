import { useNavigate } from "@tanstack/react-router";

import { ProductInventorySummary } from "~/pages/index/components/product-inventory-summary";
import { ProductsSection } from "~/pages/index/components/products-section";
import { useCreateProduct } from "~/pages/index/hooks/use-create-product";
import { useDeleteProduct } from "~/pages/index/hooks/use-delete-product";
import { useProducts } from "~/pages/index/hooks/use-products";
import { useUpdateProduct } from "~/pages/index/hooks/use-update-product";

export const Index = () => {
  const navigate = useNavigate();
  const {
    data: products,
    isLoading,
    pendingOperations,
    productPagination,
    setProductPagination,
    setProducts,
  } = useProducts();
  const { createProduct, isCreatingProduct } = useCreateProduct({
    products,
    setProducts,
  });
  const { isUpdatingProduct, updateProduct } = useUpdateProduct({
    products,
    setProducts,
  });
  const { deleteProduct, isDeletingProduct } = useDeleteProduct({
    products,
    setProducts,
  });
  const isSaving = isCreatingProduct || isUpdatingProduct || isDeletingProduct;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <ProductInventorySummary
        onViewPendingOperations={() => {
          void navigate({ to: "/pending-operations" });
        }}
        pendingOperations={pendingOperations.length}
        productsCount={productPagination.total}
      />

      <ProductsSection
        isDeletingProduct={isDeletingProduct}
        isLoading={isLoading}
        isSaving={isSaving}
        onCreateProduct={createProduct}
        onDeleteProduct={deleteProduct}
        onProductPaginationChange={(page, perPage) => {
          setProductPagination({ page, perPage });
        }}
        onUpdateProduct={updateProduct}
        pagination={productPagination}
        products={products}
      />
    </main>
  );
};
