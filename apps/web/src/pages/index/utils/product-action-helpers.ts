import type { Dispatch, SetStateAction } from "react";
import { ZodError, type ZodIssue } from "zod";

import type { Product } from "~/pages/index/schemas";

/**
 * User-facing message shown when a product SKU already exists locally.
 */
export const duplicateSkuErrorMessage =
  "A product with this SKU already exists.";

/**
 * Shared dependencies used by product mutation hooks.
 */
export type ProductMutationHookParams = {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
};

/**
 * Gets the display message from a Zod validation issue.
 *
 * @returns The validation issue message.
 */
const getZodIssueMessage = (issue: ZodIssue) => issue.message;

/**
 * Converts a product mutation failure into a user-facing error message.
 *
 * @returns A normalized error message for product action failures.
 */
export const getProductActionErrorMessage = (error: unknown) => {
  if (error instanceof ZodError) {
    return error.issues.map(getZodIssueMessage).join(". ");
  }

  if (error instanceof Error) {
    if (error.name === "ConstraintError") {
      return duplicateSkuErrorMessage;
    }

    return error.message;
  }

  return "The local inventory action failed.";
};

/**
 * Gets a product by id or throws when the product is missing.
 *
 * @returns The matching product.
 */
export const getRequiredProduct = (products: Product[], id: string) => {
  const product = products.find((existingProduct) => existingProduct.id === id);

  if (product) {
    return product;
  }

  throw new Error("Product not found");
};

/**
 * Asserts that no other product uses the same SKU.
 */
export const assertProductSkuIsUnique = (
  product: Product,
  products: Product[],
) => {
  for (const existingProduct of products) {
    if (existingProduct.id === product.id) return;

    if (existingProduct.sku === product.sku) {
      throw new Error(duplicateSkuErrorMessage);
    }
  }
};

/**
 * Sorts a product list alphabetically by product name.
 *
 * @returns A new sorted product list.
 */
const sortProductsByName = (products: Product[]) =>
  [...products].sort((first, second) => first.name.localeCompare(second.name));

/**
 * Adds a product to the optimistic local product list.
 *
 * @returns A sorted product list containing the new product.
 */
export const addOptimisticProduct = (products: Product[], product: Product) =>
  sortProductsByName([...products, product]);

/**
 * Replaces a product in the optimistic local product list.
 *
 * @returns A sorted product list containing the updated product.
 */
export const replaceOptimisticProduct = (
  products: Product[],
  product: Product,
) =>
  sortProductsByName(
    products.map((existingProduct) =>
      existingProduct.id === product.id ? product : existingProduct,
    ),
  );

/**
 * Removes a product from the optimistic local product list.
 *
 * @returns A product list without the removed product.
 */
export const removeOptimisticProduct = (products: Product[], id: string) =>
  products.filter((product) => product.id !== id);
