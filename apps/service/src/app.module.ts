import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import path from "node:path";

import { DatabaseModule } from "~/database/database.module";
import { HttpExceptionFilter } from "~/filters/http-exception.filter";
import { HealthModule } from "~/health/health.module";
import { ProductModule } from "~/product/product.module";

const envFilePath = path.join(process.cwd(), "..", "..", ".env");

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath],
    }),
    HealthModule,
    DatabaseModule,
    ProductModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
