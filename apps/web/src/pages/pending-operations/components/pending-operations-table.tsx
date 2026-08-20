import { DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Button, Empty, Space, Table, Tag, Tooltip, Typography } from "antd";

import type { SyncOperation } from "~/pages/index/schemas";
import { dateTimeFormat } from "~/utils/date-time-format";

type PendingOperationsTableProps = {
  isLoading: boolean;
  onExcludeOperation: (operation: SyncOperation) => void;
  onExecuteOperation: (operation: SyncOperation) => void;
  onPaginationChange: (page: number, perPage: number) => void;
  onSelectionChange: (operationIds: string[]) => void;
  operations: SyncOperation[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  processingOperationIds: string[];
  selectedOperationIds: string[];
};

const operationTypeColor = {
  CREATE: "green",
  DELETE: "red",
  UPDATE: "blue",
} satisfies Record<SyncOperation["type"], string>;

const getOperationProductLabel = (operation: SyncOperation) => {
  if (operation.type === "DELETE") {
    return "Deleted product";
  }

  return operation.payload.name;
};

const getOperationPayloadDetail = (operation: SyncOperation) => {
  if (operation.type === "DELETE") {
    return operation.payload.id;
  }

  return `SKU ${operation.payload.sku} - Quantity ${operation.payload.quantity}`;
};

export const PendingOperationsTable = ({
  isLoading,
  onExcludeOperation,
  onExecuteOperation,
  onPaginationChange,
  onSelectionChange,
  operations,
  pagination,
  processingOperationIds,
  selectedOperationIds,
}: PendingOperationsTableProps) => {
  const columns: TableProps<SyncOperation>["columns"] = [
    {
      dataIndex: "type",
      render: (type: SyncOperation["type"]) => (
        <Tag color={operationTypeColor[type]}>{type}</Tag>
      ),
      title: "Operation",
      width: 130,
    },
    {
      render: (_: unknown, operation) => (
        <div className="flex flex-col">
          <Typography.Text strong>
            {getOperationProductLabel(operation)}
          </Typography.Text>
          <Typography.Text className="text-xs" type="secondary">
            {getOperationPayloadDetail(operation)}
          </Typography.Text>
        </div>
      ),
      title: "Product",
      width: 260,
    },
    {
      dataIndex: "entityId",
      ellipsis: { showTitle: false },
      render: (entityId: SyncOperation["entityId"]) => (
        <Typography.Text copyable type="secondary">
          {entityId}
        </Typography.Text>
      ),
      title: "Entity ID",
      width: 260,
    },
    {
      dataIndex: "createdAt",
      render: (createdAt: SyncOperation["createdAt"]) =>
        dateTimeFormat.format(new Date(createdAt)),
      title: "Queued At",
      width: 190,
    },
    {
      key: "actions",
      render: (_: unknown, operation) => {
        const isProcessing = processingOperationIds.includes(operation.id);

        return (
          <Space className="flex justify-center items-center">
            <Tooltip title="Exclude operation">
              <Button
                aria-label="Exclude operation"
                danger
                icon={<DeleteOutlined />}
                loading={isProcessing}
                onClick={() => {
                  onExcludeOperation(operation);
                }}
              />
            </Tooltip>
            <Tooltip title="Execute operation">
              <Button
                aria-label="Execute operation"
                icon={<PlayCircleOutlined />}
                loading={isProcessing}
                onClick={() => {
                  onExecuteOperation(operation);
                }}
                type="primary"
              />
            </Tooltip>
          </Space>
        );
      },
      align: "center",
      width: 110,
    },
  ];

  return (
    <Table<SyncOperation>
      columns={columns}
      dataSource={operations}
      loading={isLoading}
      bordered
      locale={{
        emptyText: (
          <Empty
            description="No pending operations"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ),
      }}
      pagination={{
        current: pagination.page,
        onChange: onPaginationChange,
        pageSize: pagination.perPage,
        pageSizeOptions: ["10", "20", "40"],
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} operations`,
        total: pagination.total,
      }}
      rowKey="id"
      rowSelection={{
        onChange: (operationIds) => {
          onSelectionChange(operationIds.map(String));
        },
        selectedRowKeys: selectedOperationIds,
      }}
      scroll={{ x: 840, y: 620 }}
    />
  );
};
