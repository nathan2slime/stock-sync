import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "~/generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = String(process.env.DATABASE_URL);

    super({
      adapter: new PrismaPg(connectionString),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
