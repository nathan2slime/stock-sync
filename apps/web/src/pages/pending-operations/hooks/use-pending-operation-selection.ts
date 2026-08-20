import { useEffect, useState } from "react";

import type { SyncOperation } from "~/pages/index/schemas";

export const usePendingOperationSelection = (operations: SyncOperation[]) => {
  const [selectedOperationIds, setSelectedOperationIds] = useState<string[]>(
    [],
  );

  const selectedOperations = operations.filter((operation) =>
    selectedOperationIds.includes(operation.id),
  );

  const clearSelection = () => {
    setSelectedOperationIds([]);
  };

  useEffect(() => {
    const visibleOperationIds = new Set(
      operations.map((operation) => operation.id),
    );

    setSelectedOperationIds((operationIds) =>
      operationIds.filter((operationId) =>
        visibleOperationIds.has(operationId),
      ),
    );
  }, [operations, setSelectedOperationIds]);

  return {
    clearSelection,
    selectedOperationIds,
    selectedOperations,
    setSelectedOperationIds,
  };
};
