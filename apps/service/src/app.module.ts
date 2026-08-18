import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import path from "node:path";

import { DatabaseModule } from "~/database/database.module";
import { HealthModule } from "~/health/health.module";

const envFilePath = path.join(process.cwd(), "..", "..", ".env");

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath],
    }),
    HealthModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
