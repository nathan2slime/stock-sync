import { Form, Input, InputNumber } from "antd";

import type { ProductDraft } from "~/pages/index/schemas";

/**
 * Props for the controlled product draft form.
 */
type ProductFormProps = {
  form: ReturnType<typeof Form.useForm<ProductDraft>>[0];
  onFinish: (values: ProductDraft) => void;
};

export const ProductForm = ({ form, onFinish }: ProductFormProps) => (
  <div className="py-4">
    <Form<ProductDraft> form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="SKU"
        name="sku"
        rules={[{ required: true, message: "SKU is required" }]}
      >
        <Input
          allowClear
          autoComplete="off"
          inputMode="numeric"
          maxLength={6}
          placeholder="342143901"
        />
      </Form.Item>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Name is required" }]}
      >
        <Input allowClear autoComplete="off" placeholder="Cotton Red T-shirt" />
      </Form.Item>
      <Form.Item
        label="Quantity"
        name="quantity"
        rules={[{ required: true, message: "Quantity is required" }]}
      >
        <InputNumber autoComplete="off" min={0} precision={0} />
      </Form.Item>
    </Form>
  </div>
);
