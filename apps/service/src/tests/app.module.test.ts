import "reflect-metadata";

import { Test } from "@nestjs/testing";
import { describe, expect, rs, test } from "@rstest/core";

import { AppModule } from "~/app.module";
import { HealthController } from "~/health/health.controller";
import { PrismaService } from "~/database/prisma.service";

describe("AppModule", () => {
  test("wires the health controller with a mocked prisma provider", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $disconnect: rs.fn(),
      })
      .compile();

    expect(moduleRef.get(HealthController)).toBeInstanceOf(HealthController);

    await moduleRef.close();
  });
});
