import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "~/app.module";
import { configureSwagger } from "~/configure-swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix("api");
  configureSwagger(app);
  app.enableCors({
    origin: process.env.CROSS_ORIGIN_SERVICE,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT || 5400);

  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
    import.meta.webpackHot.dispose(() => app.close());
  }
}

bootstrap();
