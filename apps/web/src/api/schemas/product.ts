import { z } from "zod";

import {
  productDraftSchema,
  productSchema,
  type Product,
} from "~/pages/index/schemas";

const remoteProductSchema = productDraftSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

type RemoteProduct = z.infer<typeof remoteProductSchema>;

const normalizeRemoteProduct = (product: RemoteProduct): Product =>
  productSchema.parse({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    version: 1,
  });

export const productResponseSchema = remoteProductSchema.transform(
  normalizeRemoteProduct,
);

export const productListResponseSchema = z
  .object({
    data: z.array(remoteProductSchema),
    page: z.number().int().min(1),
    pages: z.number().int().min(0),
    perPage: z.number().int().min(1),
    total: z.number().int().min(0),
  })
  .transform((payload) => ({
    ...payload,
    data: payload.data.map(normalizeRemoteProduct),
  }));

export type ProductListQueryResult = z.infer<typeof productListResponseSchema>;
