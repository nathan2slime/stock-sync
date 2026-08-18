import { PlusOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";

import { ProductTable } from "~/pages/index/components/product-table";
import { useProductEditor } from "~/pages/index/hooks/use-product-editor";
import type { Product, ProductDraft } from "~/pages/index/schemas";

/**
 * Props for the products section header and table composition.
 */
type ProductsSectionProps = {
  isDeletingProduct: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onCreateProduct: (values: ProductDraft) => Promise<Product | null>;
  onDeleteProduct: (id: Product["id"]) => Promise<Product | null>;
  onUpdateProduct: (
    id: Product["id"],
    values: ProductDraft,
  ) => Promise<Product | null>;
  products: Product[];
};

export const ProductsSection = ({
  isDeletingProduct,
  isLoading,
  isSaving,
  onCreateProduct,
  onDeleteProduct,
  onUpdateProduct,
  products,
}: ProductsSectionProps) => {
  const productEditor = useProductEditor();

  return (
    <div className="mt-2">
      <div className="flex w-full justify-between py-4 items-center">
        <Typography.Title className="m-0!" level={5}>
          Products
        </Typography.Title>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={productEditor.openCreateProduct}
        >
          New
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        <ProductTable
          isDeletingProduct={isDeletingProduct}
          isLoading={isLoading}
          isSaving={isSaving}
          onCreateProduct={onCreateProduct}
          onDeleteProduct={onDeleteProduct}
          onUpdateProduct={onUpdateProduct}
          productEditor={productEditor}
          products={products}
        />
      </div>
    </div>
  );
};
