import { Modal, Typography } from "antd";

/**
 * Props for the product deletion confirmation dialog.
 */
type ProductDeleteConfirmationModalProps = {
  isSaving: boolean;
  onCancel: VoidFunction;
  onConfirm: VoidFunction;
  open: boolean;
};

export const ProductDeleteConfirmationModal = ({
  isSaving,
  onCancel,
  onConfirm,
  open,
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
      This action will permanently delete the product. Are you sure you want to
      delete?
    </Typography.Paragraph>
  </Modal>
);
