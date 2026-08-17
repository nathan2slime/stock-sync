import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "~/health/health.controller";
import { PrismaService } from "~/prisma/prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
