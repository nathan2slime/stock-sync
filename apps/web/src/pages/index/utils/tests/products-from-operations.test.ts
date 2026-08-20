import { describe, expect, test } from "@rstest/core";

import type { Product, SyncOperation } from "~/pages/index/schemas";

import {
  getProductFromOperations,
  getProductsFromOperations,
} from "../products-from-operations";

const createdAt = "2026-08-18T12:00:00.000Z";

const createProduct = (id: string, name: string, sku: number): Product => ({
  id,
  name,
  sku,
  quantity: 10,
  version: 1,
  createdAt,
  updatedAt: createdAt,
});

const createOperation = (
  id: string,
  product: Product,
  createdAtValue = product.createdAt,
): SyncOperation => ({
  id,
  entityId: product.id,
  type: "CREATE",
  payload: product,
  status: "pending",
  createdAt: createdAtValue,
});

const updateOperation = (id: string, product: Product): SyncOperation => ({
  id,
  entityId: product.id,
  type: "UPDATE",
  payload: product,
  status: "pending",
  createdAt: product.updatedAt,
});

const deleteOperation = (id: string, productId: string): SyncOperation => ({
  id,
  entityId: productId,
  type: "DELETE",
  payload: { id: productId },
  status: "pending",
  createdAt,
});

describe("getProductsFromOperations", () => {
  test("derives the latest sorted product list from sync operations", () => {
    const bolt = createProduct(
      "00000000-0000-4000-8000-000000000001",
      "Bolt",
      1001,
    );
    const cable = createProduct(
      "00000000-0000-4000-8000-000000000002",
      "Cable",
      1002,
    );
    const updatedCable = {
      ...cable,
      name: "Anchor cable",
      updatedAt: "2026-08-18T12:05:00.000Z",
      version: 2,
    } satisfies Product;

    const products = getProductsFromOperations([
      createOperation("00000000-0000-4000-8000-000000000101", cable),
      createOperation("00000000-0000-4000-8000-000000000102", bolt),
      updateOperation("00000000-0000-4000-8000-000000000103", updatedCable),
    ]);

    expect(products).toEqual([updatedCable, bolt]);
  });

  test("removes deleted products from the derived list", () => {
    const product = createProduct(
      "00000000-0000-4000-8000-000000000003",
      "Deleted product",
      1003,
    );

    expect(
      getProductsFromOperations([
        createOperation("00000000-0000-4000-8000-000000000104", product),
        deleteOperation("00000000-0000-4000-8000-000000000105", product.id),
      ]),
    ).toEqual([]);
  });

  test("overlays sync operations onto service products", () => {
    const bolt = createProduct(
      "00000000-0000-4000-8000-000000000005",
      "Bolt",
      1005,
    );
    const cable = createProduct(
      "00000000-0000-4000-8000-000000000006",
      "Cable",
      1006,
    );
    const washer = createProduct(
      "00000000-0000-4000-8000-000000000007",
      "Washer",
      1007,
    );
    const updatedBolt = {
      ...bolt,
      quantity: 30,
      updatedAt: "2026-08-18T12:15:00.000Z",
      version: 2,
    } satisfies Product;

    expect(
      getProductsFromOperations(
        [
          updateOperation("00000000-0000-4000-8000-000000000108", updatedBolt),
          deleteOperation("00000000-0000-4000-8000-000000000109", cable.id),
          createOperation("00000000-0000-4000-8000-000000000110", washer),
        ],
        [bolt, cable],
      ),
    ).toEqual([updatedBolt, washer]);
  });
});

describe("getProductFromOperations", () => {
  test("returns the latest state for one product", () => {
    const product = createProduct(
      "00000000-0000-4000-8000-000000000004",
      "Product",
      1004,
    );
    const updatedProduct = {
      ...product,
      quantity: 25,
      updatedAt: "2026-08-18T12:10:00.000Z",
      version: 2,
    } satisfies Product;

    expect(
      getProductFromOperations(
        [
          createOperation("00000000-0000-4000-8000-000000000106", product),
          updateOperation(
            "00000000-0000-4000-8000-000000000107",
            updatedProduct,
          ),
        ],
        product.id,
      ),
    ).toEqual(updatedProduct);
  });
});
