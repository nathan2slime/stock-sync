import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useState } from "react";

import { ProductDeleteConfirmationModal } from "~/pages/index/components/product-delete-confirmation-modal";
import { ProductEditorModal } from "~/pages/index/components/product-editor-modal";
import { useProductEditor } from "~/pages/index/hooks/use-product-editor";
import type { Product, ProductDraft } from "~/pages/index/schemas";

type ProductTableActionsProps = {
  isDeletingProduct: boolean;
  isUpdatingProduct: boolean;
  onDeleteProduct: (id: Product["id"]) => Promise<Product | null>;
  onUpdateProduct: (
    id: Product["id"],
    values: ProductDraft,
  ) => Promise<Product | null>;
  product: Product;
};

export const ProductTableActions = ({
  isDeletingProduct,
  isUpdatingProduct,
  onDeleteProduct,
  onUpdateProduct,
  product,
}: ProductTableActionsProps) => {
  const productEditor = useProductEditor();
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const handleEditProduct = () => {
    productEditor.openEditProduct(product);
  };

  const saveEditedProduct = async (values: ProductDraft) => {
    const updatedProduct = await onUpdateProduct(product.id, values);

    if (updatedProduct) {
      productEditor.closeProductModal();
    }
  };

  const handleOpenDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(false);
  };

  const deleteSelectedProduct = async () => {
    const deletedProduct = await onDeleteProduct(product.id);

    if (deletedProduct) {
      handleCloseDeleteConfirmation();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Tooltip title="Edit product">
          <Button
            aria-label="Edit product"
            icon={<EditOutlined />}
            onClick={handleEditProduct}
            shape="default"
          />
        </Tooltip>
        <Tooltip title="Delete product">
          <Button
            aria-label="Delete product"
            danger
            icon={<DeleteOutlined />}
            onClick={handleOpenDeleteConfirmation}
            shape="default"
          />
        </Tooltip>
      </div>

      <ProductEditorModal
        form={productEditor.productForm}
        isSaving={isUpdatingProduct}
        mode={productEditor.productModalMode}
        onCancel={productEditor.closeProductModal}
        onFinish={saveEditedProduct}
        open={Boolean(productEditor.productModalMode)}
      />

      <ProductDeleteConfirmationModal
        isSaving={isDeletingProduct}
        onCancel={handleCloseDeleteConfirmation}
        onConfirm={deleteSelectedProduct}
        open={isDeleteConfirmationOpen}
        product={product}
      />
    </>
  );
};
