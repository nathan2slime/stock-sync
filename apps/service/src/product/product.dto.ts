import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, MaxLength, Min } from "class-validator";

export class CreateProductDto {
  @IsInt()
  @Max(999999)
  @Min(1)
  @ApiProperty({
    type: "number",
    description: "The SKU of the product",
    example: 34243,
  })
  sku: number;

  @MaxLength(450)
  @ApiProperty({
    type: "string",
    description: "The name of the product",
    example: "Product Name",
  })
  name: string;

  @IsInt()
  @Min(0)
  @ApiProperty({
    type: "number",
    description: "The quantity of the product",
    example: 100,
  })
  quantity: number;
}

export class UpdateProductDto {
  @MaxLength(450)
  @IsOptional()
  @ApiProperty({
    type: "string",
    description: "The name of the product",
    example: "Product Name",
    required: false,
  })
  name: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    type: "number",
    description: "The quantity of the product",
    example: 100,
    required: false,
  })
  quantity: number;
}

export class FindProductDto {
  @ApiProperty({
    type: "number",
    description: "The page number for pagination",
    example: 1,
  })
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({
    type: "number",
    description: "The number of products per page",
    example: 10,
  })
  @Min(1)
  @Max(40)
  @Type(() => Number)
  perPage: number;
}
