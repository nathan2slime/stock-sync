import { Controller, Get } from "@nestjs/common";
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from "@nestjs/terminus";

import { PrismaService } from "~/prisma/prisma.service";

const mebibyte = 1024 * 1024;

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.ready();
  }

  @Get("live")
  @HealthCheck()
  live() {
    return this.health.check([
      () =>
        this.disk.checkStorage("disk", {
          path: "/",
          thresholdPercent: 0.9,
        }),
      () => this.memory.checkHeap("memory_heap", 300 * mebibyte),
      () => this.memory.checkRSS("memory_rss", 512 * mebibyte),
    ]);
  }

  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () =>
        this.disk.checkStorage("disk", {
          path: "/",
          thresholdPercent: 0.9,
        }),
      () => this.memory.checkHeap("memory_heap", 300 * mebibyte),
      () => this.memory.checkRSS("memory_rss", 512 * mebibyte),
      () => this.prisma.pingCheck("postgres", this.prismaService, { timeout: 1_000 }),
    ]);
  }
}
