import { PlusOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";

import { ProductTable } from "~/pages/index/components/product-table";
import type { Product, ProductDraft } from "~/pages/index/schemas";

/**
 * Props for the products section header and table composition.
 */
type ProductsSectionProps = {
  isDeletingProduct: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isUpdatingProduct: boolean;
  onCreateProduct: VoidFunction;
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
  isUpdatingProduct,
  onCreateProduct,
  onDeleteProduct,
  onUpdateProduct,
  products,
}: ProductsSectionProps) => (
  <div className="mt-2">
    <div className="flex w-full justify-between py-4 items-center">
      <Typography.Title className="m-0!" level={5}>
        Products
      </Typography.Title>
      <Button icon={<PlusOutlined />} type="primary" onClick={onCreateProduct}>
        New
      </Button>
    </div>

    <div className="flex flex-col gap-5">
      <ProductTable
        isDeletingProduct={isDeletingProduct}
        isLoading={isLoading}
        isSaving={isSaving}
        isUpdatingProduct={isUpdatingProduct}
        onDeleteProduct={onDeleteProduct}
        onUpdateProduct={onUpdateProduct}
        products={products}
      />
    </div>
  </div>
);
