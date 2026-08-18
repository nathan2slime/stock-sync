import Dexie, { type Table } from "dexie";

import type { SyncOperation } from "~/pages/index/schemas";

/**
 * Dexie database shape used by the local inventory store.
 * @see https://dexie.org/docs/Typescript
 */
type InventoryDatabase = Dexie & {
  operations: Table<SyncOperation, string>;
};

/**
 * Creates and configures the local inventory database.
 *
 * The database stores pending and completed synchronization operations
 * used to keep the local inventory state in sync with the backend.
 *
 * @returns A configured Dexie instance for the inventory database.
 */
const createInventoryDb = (): InventoryDatabase => {
  const database = new Dexie("stock-sync-inventory") as InventoryDatabase;

  database.version(3).stores({
    products: null,
    operations: "id,entityId,type,status,createdAt",
  });

  return database;
};

/**
 * Shared instance of the local inventory database.
 */
export const inventoryDb = createInventoryDb();
