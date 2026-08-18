import { Loading3QuartersOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Empty, Table, Tag } from "antd";

import { ProductTableActions } from "~/pages/index/components/product-table-actions";
import { ProductTableCellText } from "~/pages/index/components/product-table-cell-text";
import type { Product, ProductDraft } from "~/pages/index/schemas";

/**
 * Props for rendering the sortable inventory product table.
 */
type ProductTableProps = {
  isDeletingProduct: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isUpdatingProduct: boolean;
  onDeleteProduct: (id: Product["id"]) => Promise<Product | null>;
  onUpdateProduct: (
    id: Product["id"],
    values: ProductDraft,
  ) => Promise<Product | null>;
  products: Product[];
};

const productDateTimeFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const ProductTable = ({
  isDeletingProduct,
  isLoading,
  isSaving,
  isUpdatingProduct,
  onDeleteProduct,
  onUpdateProduct,
  products,
}: ProductTableProps) => {
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
        <ProductTableCellText
          value={productDateTimeFormat.format(new Date(value))}
        />
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
        <ProductTableCellText
          value={productDateTimeFormat.format(new Date(value))}
        />
      ),
      sorter: (first, second) =>
        first.updatedAt.localeCompare(second.updatedAt),
      width: 190,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, product) => (
        <ProductTableActions
          isDeletingProduct={isDeletingProduct}
          isUpdatingProduct={isUpdatingProduct}
          onDeleteProduct={onDeleteProduct}
          onUpdateProduct={onUpdateProduct}
          product={product}
        />
      ),
      width: 110,
    },
  ];

  return (
    <Table<Product>
      columns={columns}
      dataSource={products}
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
      pagination={false}
      rowKey="id"
      scroll={{ x: 1010 }}
    />
  );
};
