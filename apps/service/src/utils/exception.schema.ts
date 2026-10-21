import { HttpStatus } from "@nestjs/common";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ description: "Exception Schema" })
export class ExceptionSchema {
  @ApiProperty({
    type: "number",
    example: 404,
    description: "The HTTP status code of the error",
  })
  statusCode: HttpStatus;

  @ApiProperty({
    type: "string",
    example: "2023-01-01T00:00:00.000Z",
    description: "The timestamp of the error",
  })
  timestamp: string;

  @ApiProperty({
    type: "string",
    example: "/api/brands/1",
    description: "The path of the request that caused the error",
  })
  path: string;

  @ApiProperty({
    oneOf: [
      { type: "string", example: "Brand not found" },
      {
        type: "array",
        items: { type: "string" },
        example: ["name must be a string", "name should not be empty"],
      },
    ],
    description: "The error message",
  })
  message: string | string[];
}
