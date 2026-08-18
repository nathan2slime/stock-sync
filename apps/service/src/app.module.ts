import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
import path from "node:path";

import { HealthController } from "~/health/health.controller";
import { PrismaService } from "~/prisma/prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(process.cwd(), "..", "..", ".env")],
    }),
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
