import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateProductDto {
  @IsInt({ message: "SKU must be a whole number." })
  @Max(999999, { message: "SKU must have at most 6 digits." })
  @Min(1, { message: "SKU must be greater than zero." })
  @Type(() => Number)
  @ApiProperty({
    type: "number",
    description: "The SKU of the product",
    example: 34243,
  })
  sku: number;

  @IsString({ message: "Product name must be text." })
  @MaxLength(450, { message: "Product name must be 450 characters or less." })
  @ApiProperty({
    type: "string",
    description: "The name of the product",
    example: "Product Name",
  })
  name: string;

  @IsInt({ message: "Quantity must be a whole number." })
  @Min(0, { message: "Quantity cannot be negative." })
  @Type(() => Number)
  @ApiProperty({
    type: "number",
    description: "The quantity of the product",
    example: 100,
  })
  quantity: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: "Product name must be text." })
  @MaxLength(450, { message: "Product name must be 450 characters or less." })
  @ApiProperty({
    type: "string",
    description: "The name of the product",
    example: "Product Name",
    required: false,
  })
  name: string;

  @IsOptional()
  @IsInt({ message: "Quantity must be a whole number." })
  @Min(0, { message: "Quantity cannot be negative." })
  @Type(() => Number)
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
  @Min(1, { message: "Page must be greater than zero." })
  @Type(() => Number)
  page: number;

  @ApiProperty({
    type: "number",
    description: "The number of products per page",
    example: 10,
  })
  @Min(1, { message: "Items per page must be greater than zero." })
  @Max(40, { message: "Items per page cannot be greater than 40." })
  @Type(() => Number)
  perPage: number;
}
