import { ProductInventorySummary } from "~/pages/index/components/product-inventory-summary";
import { ProductsSection } from "~/pages/index/components/products-section";
import { useCreateProduct } from "~/pages/index/hooks/use-create-product";
import { useDeleteProduct } from "~/pages/index/hooks/use-delete-product";
import { usePendingOperationsCount } from "~/pages/index/hooks/use-pending-operations-count";
import { useProducts } from "~/pages/index/hooks/use-products";
import { useUpdateProduct } from "~/pages/index/hooks/use-update-product";

export const Index = () => {
  const { data: products, isLoading, setProducts } = useProducts();
  const pendingOperations = usePendingOperationsCount();
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
        pendingOperations={pendingOperations}
        productsCount={products.length}
      />

      <ProductsSection
        isDeletingProduct={isDeletingProduct}
        isLoading={isLoading}
        isSaving={isSaving}
        onCreateProduct={createProduct}
        onDeleteProduct={deleteProduct}
        onUpdateProduct={updateProduct}
        products={products}
      />
    </main>
  );
};
