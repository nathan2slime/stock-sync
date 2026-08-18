import type { FormInstance } from "antd";
import { Modal } from "antd";

import { ProductForm } from "~/pages/index/components/product-form";
import type { ProductEditorMode } from "~/pages/index/hooks/use-product-editor";
import type { ProductDraft } from "~/pages/index/schemas";

/**
 * Active editor modal mode, or `null` when the modal is closed.
 */
type ProductEditorModalMode = ProductEditorMode | null;

/**
 * Props for the product editor modal and its embedded form.
 */
type ProductEditorModalProps = {
  form: FormInstance<ProductDraft>;
  isSaving: boolean;
  mode: ProductEditorModalMode;
  onCancel: VoidFunction;
  onFinish: (values: ProductDraft) => void;
  open: boolean;
};

const productEditorTitleByMode = {
  create: "New Product",
  edit: "Edit Product",
} satisfies Record<ProductEditorMode, string>;

export const ProductEditorModal = ({
  form,
  isSaving,
  mode,
  onCancel,
  onFinish,
  open,
}: ProductEditorModalProps) => {
  return (
    <Modal
      confirmLoading={isSaving}
      forceRender
      okText="Save"
      onCancel={onCancel}
      onOk={form.submit}
      open={open}
      title={productEditorTitleByMode[mode ?? "create"]}
    >
      <ProductForm form={form} onFinish={onFinish} />
    </Modal>
  );
};
