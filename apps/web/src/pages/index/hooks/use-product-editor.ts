import { Form } from "antd";
import { useState } from "react";

import type { Product, ProductDraft } from "~/pages/index/schemas";

/**
 * Supported modes for the product editor modal.
 */
export type ProductEditorMode = "create" | "edit";

/**
 * Describes the active product editor modal and its form seed values.
 */
export type ProductModalState = {
  initialValues: Partial<ProductDraft>;
  mode: ProductEditorMode;
  productId: string | null;
};

const createProductInitialValues = {
  name: "",
  quantity: 0,
} satisfies Partial<ProductDraft>;

/**
 * Manages product editor modal visibility, mode, selected product, and form state.
 *
 * @returns Modal controls, the Ant Design form instance, and the current editor state.
 */
export const useProductEditor = () => {
  const [productForm] = Form.useForm<ProductDraft>();
  const [productModal, setProductModal] = useState<ProductModalState | null>(
    null,
  );

  const openCreateProduct = () => {
    productForm.setFieldsValue(createProductInitialValues);
    setProductModal({
      initialValues: createProductInitialValues,
      mode: "create",
      productId: null,
    });
  };

  const openEditProduct = (product: Product) => {
    productForm.setFieldsValue(product);
    setProductModal({
      initialValues: product,
      mode: "edit",
      productId: product.id,
    });
  };

  const closeProductModal = () => {
    productForm.resetFields();
    setProductModal(null);
  };

  return {
    closeProductModal,
    openCreateProduct,
    openEditProduct,
    productForm,
    productModal,
    productModalMode: productModal ? productModal.mode : null,
  };
};
