import { Loading3QuartersOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Empty, Table, Tag } from "antd";

import { ProductEditorModal } from "~/pages/index/components/product-editor-modal";
import { ProductTableActions } from "~/pages/index/components/product-table-actions";
import { ProductTableCellText } from "~/pages/index/components/product-table-cell-text";
import type { useProductEditor } from "~/pages/index/hooks/use-product-editor";
import type { Product, ProductDraft } from "~/pages/index/schemas";
import { dateTimeFormat } from "~/utils/date-time-format";

/**
 * Props for rendering the sortable inventory product table.
 */
type ProductTableProps = {
  isDeletingProduct: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onCreateProduct: (values: ProductDraft) => Promise<Product | null>;
  onDeleteProduct: (id: Product["id"]) => Promise<Product | null>;
  onProductPaginationChange: (page: number, perPage: number) => void;
  onUpdateProduct: (
    id: Product["id"],
    values: ProductDraft,
  ) => Promise<Product | null>;
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  productEditor: ReturnType<typeof useProductEditor>;
  products: Product[];
};

export const ProductTable = ({
  isDeletingProduct,
  isLoading,
  isSaving,
  onCreateProduct,
  onDeleteProduct,
  onProductPaginationChange,
  onUpdateProduct,
  pagination,
  productEditor,
  products,
}: ProductTableProps) => {
  const productModal = productEditor.productModal;
  const handleSaveProduct = async (values: ProductDraft) => {
    const product = await saveProduct(values);

    if (product) {
      productEditor.closeProductModal();
    }
  };

  const saveProduct = async (values: ProductDraft) => {
    if (productModal) {
      if (productModal.mode === "create") {
        return onCreateProduct(values);
      } else if (productModal.productId) {
        return onUpdateProduct(productModal.productId, values);
      }
    }

    return;
  };

  const columns: TableProps<Product>["columns"] = [
    {
      title: "SKU",
      dataIndex: "sku",
      ellipsis: { showTitle: false },
      render: (value: Product["sku"]) => <ProductTableCellText value={value} />,
      sorter: (first, second) => first.sku - second.sku,
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "name",
      ellipsis: { showTitle: false },
      render: (value: Product["name"]) => (
        <ProductTableCellText value={value} />
      ),
      sorter: (first, second) => first.name.localeCompare(second.name),
      width: 280,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      ellipsis: { showTitle: false },
      render: (value: Product["quantity"]) => (
        <Tag variant="outlined">
          <ProductTableCellText value={value} />
        </Tag>
      ),
      sorter: (first, second) => first.quantity - second.quantity,
      width: 120,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      ellipsis: { showTitle: false },
      render: (value: Product["createdAt"]) => (
        <ProductTableCellText value={dateTimeFormat.format(new Date(value))} />
      ),
      sorter: (first, second) =>
        first.createdAt.localeCompare(second.createdAt),
      width: 190,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      ellipsis: { showTitle: false },
      render: (value: Product["updatedAt"]) => (
        <ProductTableCellText value={dateTimeFormat.format(new Date(value))} />
      ),
      sorter: (first, second) =>
        first.updatedAt.localeCompare(second.updatedAt),
      width: 190,
    },
    {
      key: "actions",
      render: (_: unknown, product) => (
        <ProductTableActions
          isDeletingProduct={isDeletingProduct}
          onDeleteProduct={onDeleteProduct}
          onEditProduct={productEditor.openEditProduct}
          product={product}
        />
      ),
      width: 110,
    },
  ];

  return (
    <>
      <Table<Product>
        columns={columns}
        dataSource={products}
        virtual
        loading={{
          indicator: (
            <Loading3QuartersOutlined className="animate-spin" size={35} />
          ),
          spinning: isLoading || isSaving,
        }}
        bordered
        showHeader
        tableLayout="fixed"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              styles={{ root: { padding: "10rem 0" } }}
              description="No products found"
            />
          ),
        }}
        pagination={{
          current: pagination.page,
          onChange: onProductPaginationChange,
          pageSize: pagination.perPage,
          pageSizeOptions: ["10", "20", "40"],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} products`,
          total: pagination.total,
        }}
        scroll={{ y: 1000, x: 1000 }}
        rowKey="id"
      />

      <ProductEditorModal
        form={productEditor.productForm}
        isSaving={isSaving}
        mode={productEditor.productModalMode}
        onCancel={productEditor.closeProductModal}
        onFinish={handleSaveProduct}
        open={Boolean(productEditor.productModalMode)}
      />
    </>
  );
};
