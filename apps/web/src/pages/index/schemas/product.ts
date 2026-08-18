import { z } from "zod";

export const productDraftSchema = z.object({
  sku: z.coerce
    .number()
    .int("SKU must be a whole number")
    .positive("SKU must be a positive number"),
  name: z.string().trim().min(1, "Name is required").max(120),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
});

export const productSchema = productDraftSchema.extend({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  version: z.number().int().min(1),
  updatedAt: z.iso.datetime(),
});

/**
 * A validated inventory product stored locally and synchronized remotely.
 */
export type Product = z.infer<typeof productSchema>;

/**
 * Form-safe product values before persistence metadata is attached.
 */
export type ProductDraft = z.infer<typeof productDraftSchema>;
