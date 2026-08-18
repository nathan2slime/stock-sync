import { syncOperationSchema, type SyncOperation } from "~/pages/index/schemas";

export const pendingSyncStatus = "pending" satisfies SyncOperation["status"];

/**
 * Narrows a sync operation union member by operation type.
 */
type SyncOperationByType<Type extends SyncOperation["type"]> = Extract<
  SyncOperation,
  { type: Type }
>;

/**
 * Creates a pending local synchronization operation with a validated payload.
 *
 * @returns A parsed synchronization operation ready to store locally.
 */
export const createSyncOperation = <Type extends SyncOperation["type"]>(
  entityId: string,
  type: Type,
  payload: SyncOperationByType<Type>["payload"],
  createdAt: string,
) =>
  syncOperationSchema.parse({
    id: crypto.randomUUID(),
    entityId,
    type,
    payload,
    status: pendingSyncStatus,
    createdAt,
  });
