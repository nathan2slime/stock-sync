import "reflect-metadata";

import { afterEach, describe, expect, rs, test } from "@rstest/core";

const prismaMocks = rs.hoisted(() => ({
  clientConstructor: rs.fn(),
  disconnect: rs.fn(async () => undefined),
  pgConstructor: rs.fn(),
}));

rs.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class PrismaPg {
    constructor(connectionString: string) {
      prismaMocks.pgConstructor(connectionString);
    }
  },
}));

rs.mock("~/generated/prisma/client", () => ({
  PrismaClient: class PrismaClient {
    $disconnect = prismaMocks.disconnect;

    constructor(options: unknown) {
      prismaMocks.clientConstructor(options);
    }
  },
}));

import { PrismaService } from "~/database/prisma.service";

describe("PrismaService", () => {
  afterEach(() => {
    rs.unstubAllEnvs();
  });

  test("configures Prisma with the database URL", () => {
    const databaseUrl = "postgresql://stock-sync:test@localhost:5432/app";

    rs.stubEnv("DATABASE_URL", databaseUrl);

    const service = new PrismaService();

    expect(service).toBeInstanceOf(PrismaService);
    expect(prismaMocks.pgConstructor).toHaveBeenCalledExactlyOnceWith(
      databaseUrl,
    );
    expect(prismaMocks.clientConstructor).toHaveBeenCalledOnce();
    expect(prismaMocks.clientConstructor.mock.calls[0]?.[0]).toEqual({
      adapter: expect.any(Object),
    });
  });

  test("disconnects the Prisma client when the module is destroyed", async () => {
    const service = new PrismaService();

    await service.onModuleDestroy();

    expect(prismaMocks.disconnect).toHaveBeenCalledOnce();
  });
});
