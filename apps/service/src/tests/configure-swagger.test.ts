import "reflect-metadata";

import { Test } from "@nestjs/testing";
import { describe, expect, rs, test } from "@rstest/core";

import { AppModule } from "~/app.module";
import { configureSwagger, swaggerPath } from "~/configure-swagger";
import { PrismaService } from "~/database/prisma.service";

type OpenApiDocument = {
  info?: {
    title?: string;
  };
  paths?: Record<string, unknown>;
};

describe("configureSwagger", () => {
  test("serves Swagger UI and OpenAPI JSON", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $disconnect: rs.fn(),
      })
      .compile();
    const app = moduleRef.createNestApplication();

    configureSwagger(app);

    await app.listen(0, "127.0.0.1");

    try {
      const appUrl = await app.getUrl();
      const openApiResponse = await fetch(`${appUrl}/${swaggerPath}-json`);
      const swaggerUiResponse = await fetch(`${appUrl}/${swaggerPath}`);
      const openApiDocument = (await openApiResponse.json()) as OpenApiDocument;

      expect(openApiResponse.ok).toBe(true);
      expect(openApiDocument.info?.title).toBe("Stock Sync API");
      expect(openApiDocument.paths).toHaveProperty("/health");
      expect(swaggerUiResponse.ok).toBe(true);
      await expect(swaggerUiResponse.text()).resolves.toContain("swagger-ui");
    } finally {
      await app.close();
    }
  });
});
