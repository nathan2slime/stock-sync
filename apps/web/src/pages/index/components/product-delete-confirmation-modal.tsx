import { Modal, Typography } from "antd";

import type { Product } from "~/pages/index/schemas";

/**
 * Props for the product deletion confirmation dialog.
 */
type ProductDeleteConfirmationModalProps = {
  isSaving: boolean;
  onCancel: VoidFunction;
  onConfirm: VoidFunction;
  open: boolean;
  product: Product | null;
};

export const ProductDeleteConfirmationModal = ({
  isSaving,
  onCancel,
  onConfirm,
  open,
  product,
}: ProductDeleteConfirmationModalProps) => (
  <Modal
    confirmLoading={isSaving}
    destroyOnHidden
    okButtonProps={{ danger: true }}
    okText="Delete"
    onCancel={onCancel}
    onOk={onConfirm}
    open={open}
    title="Delete Product"
  >
    <Typography.Paragraph>
      Are you sure you want to delete {product?.name ?? "this product"}?
    </Typography.Paragraph>
  </Modal>
);
