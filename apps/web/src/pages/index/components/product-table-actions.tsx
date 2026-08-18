import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useState } from "react";

import { ProductDeleteConfirmationModal } from "~/pages/index/components/product-delete-confirmation-modal";
import type { Product } from "~/pages/index/schemas";

type ProductTableActionsProps = {
  isDeletingProduct: boolean;
  onDeleteProduct: (id: Product["id"]) => Promise<Product | null>;
  onEditProduct: (product: Product) => void;
  product: Product;
};

export const ProductTableActions = ({
  isDeletingProduct,
  onDeleteProduct,
  onEditProduct,
  product,
}: ProductTableActionsProps) => {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const handleEditProduct = () => {
    onEditProduct(product);
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
      <div className="flex flex-wrap gap-2 justify-center">
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

      <ProductDeleteConfirmationModal
        isSaving={isDeletingProduct}
        onCancel={handleCloseDeleteConfirmation}
        onConfirm={deleteSelectedProduct}
        open={isDeleteConfirmationOpen}
      />
    </>
  );
};
