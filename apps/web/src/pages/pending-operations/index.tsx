import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Alert, Button, Space, Tooltip, Typography } from "antd";
import { useState } from "react";

import {
  defaultPendingOperationsPagination,
  usePendingOperations,
} from "~/pages/index/hooks/use-pending-operations";
import type { SyncOperation } from "~/pages/index/schemas";
import { PendingOperationsTable } from "~/pages/pending-operations/components/pending-operations-table";
import { usePendingOperationActions } from "~/pages/pending-operations/hooks/use-pending-operation-actions";
import { usePendingOperationSelection } from "~/pages/pending-operations/hooks/use-pending-operation-selection";

export const PendingOperations = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState(
    defaultPendingOperationsPagination,
  );
  const pendingOperations = usePendingOperations(pagination);
  const operationActions = usePendingOperationActions();
  const operationSelection = usePendingOperationSelection(
    pendingOperations.data,
  );
  const selectedOperationsCount =
    operationSelection.selectedOperationIds.length;

  const handleNavigateBack = () => {
    void navigate({ to: "/" });
  };

  const handleExcludeOperations = async (operations: SyncOperation[]) => {
    const succeeded = await operationActions.excludeOperations(operations);

    if (succeeded) {
      operationSelection.clearSelection();
    }
  };

  const handleExecuteOperations = async (operations: SyncOperation[]) => {
    const succeeded = await operationActions.executeOperations(operations);

    if (succeeded) {
      operationSelection.clearSelection();
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          aria-label="Back to inventory"
          icon={<ArrowLeftOutlined />}
          onClick={handleNavigateBack}
        />
        <Typography.Title className="m-0!" level={3}>
          Pending operations
        </Typography.Title>
      </div>

      <Alert
        title="Pending operations"
        description="Send saved changes when the system is ready."
        showIcon
        type="warning"
      />

      <div>
        <div className="mb-4 flex w-full justify-end">
          {selectedOperationsCount > 0 ? (
            <Space>
              <Typography.Text type="secondary">
                {selectedOperationsCount} selected
              </Typography.Text>
              <Tooltip title="Exclude selected operations">
                <Button
                  aria-label="Exclude selected operations"
                  danger
                  icon={<DeleteOutlined />}
                  loading={operationActions.isProcessingOperations}
                  onClick={() => {
                    void handleExcludeOperations(
                      operationSelection.selectedOperations,
                    );
                  }}
                />
              </Tooltip>
              <Tooltip title="Execute selected operations">
                <Button
                  aria-label="Execute selected operations"
                  icon={<PlayCircleOutlined />}
                  loading={operationActions.isProcessingOperations}
                  onClick={() => {
                    void handleExecuteOperations(
                      operationSelection.selectedOperations,
                    );
                  }}
                  type="primary"
                />
              </Tooltip>
            </Space>
          ) : null}
        </div>
        <PendingOperationsTable
          isLoading={pendingOperations.isLoading}
          onExcludeOperation={(operation) => {
            void handleExcludeOperations([operation]);
          }}
          onExecuteOperation={(operation) => {
            void handleExecuteOperations([operation]);
          }}
          onPaginationChange={(page, perPage) => {
            operationSelection.clearSelection();
            setPagination({ page, perPage });
          }}
          onSelectionChange={operationSelection.setSelectedOperationIds}
          operations={pendingOperations.data}
          pagination={{ ...pagination, total: pendingOperations.total }}
          processingOperationIds={operationActions.processingOperationIds}
          selectedOperationIds={operationSelection.selectedOperationIds}
        />
      </div>
    </main>
  );
};
