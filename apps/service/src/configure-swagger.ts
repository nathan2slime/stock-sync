import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const swaggerPath = "api/docs";

export const configureSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Stock Sync API")
    .setDescription("API documentation for the Stock Sync service.")
    .setVersion("1.0.0")
    .setBasePath("api")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: "Stock Sync API Docs",
  });
};
