import "reflect-metadata";

import type {
  DiskHealthIndicator,
  HealthCheckService,
  HealthIndicatorFunction,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { describe, expect, rs, test } from "@rstest/core";

import { HealthController } from "~/health/health.controller";
import type { PrismaService } from "~/database/prisma.service";

const mebibyte = 1024 * 1024;

describe("HealthController", () => {
  test("delegates the root health check to readiness", () => {
    const healthResult: ReturnType<HealthController["ready"]> = Promise.resolve(
      {
        status: "ok",
        details: {
          disk: { status: "up" },
          memory_heap: { status: "up" },
          memory_rss: { status: "up" },
          postgres: { status: "up" },
        },
      },
    );
    const controller = createController({
      health: {
        check: rs.fn(() => healthResult),
      },
    });
    const ready = rs.spyOn(controller, "ready").mockReturnValue(healthResult);

    expect(controller.check()).toBe(healthResult);
    expect(ready).toHaveBeenCalledOnce();
  });

  test("checks disk, heap, rss, and postgres readiness", async () => {
    const diskResult = {
      disk: { status: "up" },
    } satisfies HealthIndicatorResult<"disk">;
    const heapResult = {
      memory_heap: { status: "up" },
    } satisfies HealthIndicatorResult<"memory_heap">;
    const rssResult = {
      memory_rss: { status: "up" },
    } satisfies HealthIndicatorResult<"memory_rss">;
    const postgresResult = {
      postgres: { status: "up" },
    } satisfies HealthIndicatorResult<"postgres">;

    const health = {
      check: rs.fn(async (indicators: HealthIndicatorFunction[]) =>
        Promise.all(indicators.map((indicator) => indicator())),
      ),
    };
    const disk = {
      checkStorage: rs.fn(async () => diskResult),
    };
    const memory = {
      checkHeap: rs.fn(async () => heapResult),
      checkRSS: rs.fn(async () => rssResult),
    };
    const prisma = {
      pingCheck: rs.fn(async () => postgresResult),
    };
    const prismaService = {} as PrismaService;
    const controller = createController({
      disk,
      health,
      memory,
      prisma,
      prismaService,
    });

    await expect(controller.ready()).resolves.toEqual([
      diskResult,
      heapResult,
      rssResult,
      postgresResult,
    ]);

    expect(health.check).toHaveBeenCalledOnce();
    expect(health.check.mock.calls[0]?.[0]).toHaveLength(4);
    expect(disk.checkStorage).toHaveBeenCalledExactlyOnceWith("disk", {
      path: "/",
      thresholdPercent: 0.9,
    });
    expect(memory.checkHeap).toHaveBeenCalledExactlyOnceWith(
      "memory_heap",
      300 * mebibyte,
    );
    expect(memory.checkRSS).toHaveBeenCalledExactlyOnceWith(
      "memory_rss",
      512 * mebibyte,
    );
    expect(prisma.pingCheck).toHaveBeenCalledExactlyOnceWith(
      "postgres",
      prismaService,
      {
        timeout: 1_000,
      },
    );
  });
});

/**
 * Optional test doubles used to construct a health controller under test.
 */
type ControllerDependencies = {
  disk?: { checkStorage: (...args: unknown[]) => unknown };
  health?: { check: (...args: unknown[]) => unknown };
  memory?: {
    checkHeap: (...args: unknown[]) => unknown;
    checkRSS: (...args: unknown[]) => unknown;
  };
  prisma?: { pingCheck: (...args: unknown[]) => unknown };
  prismaService?: PrismaService;
};

function createController({
  disk = { checkStorage: rs.fn() },
  health = { check: rs.fn() },
  memory = { checkHeap: rs.fn(), checkRSS: rs.fn() },
  prisma = { pingCheck: rs.fn() },
  prismaService = {} as PrismaService,
}: ControllerDependencies = {}) {
  return new HealthController(
    health as unknown as HealthCheckService,
    disk as unknown as DiskHealthIndicator,
    memory as unknown as MemoryHealthIndicator,
    prisma as unknown as PrismaHealthIndicator,
    prismaService,
  );
}
