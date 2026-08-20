import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "~/database/prisma.service";
import {
  CreateProductDto,
  FindProductDto,
  UpdateProductDto,
} from "~/product/product.dto";

const duplicateProductSkuMessage = "A product with this SKU already exists.";
const productNotFoundMessage =
  "We could not find this product. It may have already been removed.";

type DatabaseErrorWithCode = {
  code?: unknown;
};

const hasDatabaseErrorCode = (error: unknown): error is DatabaseErrorWithCode =>
  typeof error === "object" && error !== null && "code" in error;

const getDatabaseErrorCode = (error: unknown) => {
  if (hasDatabaseErrorCode(error)) {
    const { code } = error;

    if (typeof code === "string") {
      return code;
    }
  }

  return null;
};

const throwProductDatabaseError = (error: unknown): never => {
  const code = getDatabaseErrorCode(error);

  if (code === "P2002") {
    throw new ConflictException(duplicateProductSkuMessage);
  }

  if (code === "P2025") {
    throw new NotFoundException(productNotFoundMessage);
  }

  throw error;
};

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          sku: data.sku,
          name: data.name,
          quantity: data.quantity,
        },
      });
    } catch (error) {
      throwProductDatabaseError(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throwProductDatabaseError(error);
    }
  }

  async findAll(args: FindProductDto) {
    const page = args.page || 1;
    const perPage = args.perPage || 10;
    const total = await this.prisma.product.count();
    const pages = Math.ceil(total / perPage);

    const data = await this.prisma.product.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { data, page, perPage, total, pages };
  }

  async update(id: string, data: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      throwProductDatabaseError(error);
    }
  }
}
