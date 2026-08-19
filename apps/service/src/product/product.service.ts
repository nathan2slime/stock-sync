import { Injectable } from "@nestjs/common";

import { PrismaService } from "~/database/prisma.service";
import {
  CreateProductDto,
  FindProductDto,
  UpdateProductDto,
} from "~/product/product.dto";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        quantity: data.quantity,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findAll(args: FindProductDto) {
    const page = args.page || 1;
    const perPage = args.perPage || 10;
    const total = await this.prisma.product.count();
    const pages = Math.ceil(total / perPage);

    const data = await this.prisma.product.findMany({
      skip: (args.page - 1) * args.perPage,
      take: args.perPage,
    });

    return { data, page, perPage, total, pages };
  }

  async update(id: string, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }
}
