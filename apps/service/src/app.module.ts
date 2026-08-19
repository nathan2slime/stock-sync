import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import path from "node:path";

import { DatabaseModule } from "~/database/database.module";
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
  providers: [],
})
export class AppModule {}
