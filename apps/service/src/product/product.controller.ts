import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import {
  CreateProductDto,
  FindProductDto,
  UpdateProductDto,
} from "~/product/product.dto";
import { ProductService } from "~/product/product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post("create")
  async create(@Body() data: CreateProductDto, @Res() res: Response) {
    const product = await this.productService.create(data);

    return res.status(HttpStatus.CREATED).json(product);
  }

  @Get("paginate")
  async findAll(@Query() args: FindProductDto, @Res() res: Response) {
    const products = await this.productService.findAll(args);

    return res.status(HttpStatus.OK).json(products);
  }

  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() data: UpdateProductDto,
    @Res() res: Response,
  ) {
    const product = await this.productService.update(id, data);

    return res.status(HttpStatus.OK).json(product);
  }

  @Delete("delete/:id")
  async remove(@Param("id") id: string, @Res() res: Response) {
    await this.productService.remove(id);

    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
