import { z } from "zod";

import { productSchema } from "~/pages/index/schemas/product";

const syncOperationBaseSchema = z.object({
  id: z.uuid(),
  entityId: z.uuid(),
  status: z.enum(["pending", "syncing", "synced", "failed", "conflict"]),
  createdAt: z.iso.datetime(),
});

const deletedProductPayloadSchema = z.object({ id: z.uuid() }).strict();

export const syncOperationSchema = z.discriminatedUnion("type", [
  syncOperationBaseSchema.extend({
    type: z.literal("CREATE"),
    payload: productSchema,
  }),
  syncOperationBaseSchema.extend({
    type: z.literal("UPDATE"),
    payload: productSchema,
  }),
  syncOperationBaseSchema.extend({
    type: z.literal("DELETE"),
    payload: deletedProductPayloadSchema,
  }),
]);

/**
 * A queued local inventory operation that will be synchronized with the service.
 */
export type SyncOperation = z.infer<typeof syncOperationSchema>;
