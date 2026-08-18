import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "~/app.module";
import { configureSwagger } from "~/configure-swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureSwagger(app);

  await app.listen(process.env.PORT || 5400);

  app.setGlobalPrefix("api");

  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
    import.meta.webpackHot.dispose(() => app.close());
  }
}

bootstrap();
