import {
  productSchema,
  type Product,
  type SyncOperation,
} from "~/pages/index/schemas";

/**
 * Product-shaped operation payload before schema validation.
 */
type ProductPayload = Partial<Record<keyof Product, unknown>>;

/**
 * Checks whether an operation payload can be treated as a product-like object.
 *
 * @returns `true` when the payload is a non-array object.
 */
const isProductPayload = (payload: unknown): payload is ProductPayload => {
  if (Array.isArray(payload)) {
    return false;
  }

  return typeof payload === "object" && payload !== null;
};

/**
 * Gets the product creation timestamp from a payload or falls back to the operation timestamp.
 *
 * @returns The timestamp that should be used as the product creation time.
 */
const getProductPayloadCreatedAt = (
  payload: ProductPayload,
  operation: SyncOperation,
) => {
  if (typeof payload.createdAt === "string") {
    return payload.createdAt;
  }

  return operation.createdAt;
};

/**
 * Parses a product from a CREATE or UPDATE operation payload.
 *
 * @returns A validated product, or `null` when the payload is invalid.
 */
const getProductFromOperationPayload = (operation: SyncOperation) => {
  if (isProductPayload(operation.payload)) {
    const parsedProduct = productSchema.safeParse({
      ...operation.payload,
      createdAt: getProductPayloadCreatedAt(operation.payload, operation),
      id: operation.entityId,
    });

    if (parsedProduct.success) {
      return parsedProduct.data;
    }
  }

  return null;
};

/**
 * Applies a single synchronization operation to the derived product map.
 */
const applyProductOperation = (
  productsById: Map<string, Product>,
  operation: SyncOperation,
) => {
  if (operation.type === "DELETE") {
    productsById.delete(operation.entityId);
    return;
  }

  const product = getProductFromOperationPayload(operation);

  if (product) {
    productsById.set(operation.entityId, product);
  }
};

/**
 * Sorts products alphabetically by name.
 */
const sortProductsByName = (first: Product, second: Product) =>
  first.name.localeCompare(second.name);

/**
 * Reduces synchronization operations into the latest product state by id.
 *
 * @returns Products indexed by product id.
 */
const getProductsByIdFromProducts = (products: Product[]) =>
  new Map(products.map((product) => [product.id, product]));

const getProductsByIdFromOperations = (
  operations: SyncOperation[],
  products: Product[] = [],
) => {
  const productsById = getProductsByIdFromProducts(products);

  for (const operation of operations) {
    applyProductOperation(productsById, operation);
  }

  return productsById;
};

/**
 * Gets the current sorted product list from synchronization operations.
 *
 * @returns Products sorted alphabetically by name.
 */
export const getProductsFromOperations = (
  operations: SyncOperation[],
  products: Product[] = [],
) =>
  Array.from(getProductsByIdFromOperations(operations, products).values()).sort(
    sortProductsByName,
  );

/**
 * Gets the current product state for a single product id from synchronization operations.
 *
 * @returns The matching product, or `null` when the product does not exist.
 */
export const getProductFromOperations = (
  operations: SyncOperation[],
  id: string,
  products: Product[] = [],
) => getProductsByIdFromOperations(operations, products).get(id) ?? null;
