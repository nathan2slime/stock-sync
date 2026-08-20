import "reflect-metadata";

import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { describe, expect, rs, test } from "@rstest/core";

import { HttpExceptionFilter } from "~/filters/http-exception.filter";

type ResponseBody = {
  data: unknown;
  path: string;
  statusCode: number;
  timestamp: string;
};

const requestPath = "/api/products/create";

describe("HttpExceptionFilter", () => {
  test("wraps http exceptions in the shared error response shape", () => {
    const { host, json, status } = createHttpHost();
    const filter = createFilter();

    filter.catch(new BadRequestException("Invalid product."), host);

    expect(status).toHaveBeenCalledExactlyOnceWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledOnce();
    expect(json.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          message: "Invalid product.",
        }),
        path: requestPath,
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    );
  });

  test("maps duplicate product database errors to conflict responses", () => {
    const { host, json, status } = createHttpHost();
    const filter = createFilter();

    filter.catch({ code: "P2002", message: "Unique constraint failed" }, host);

    expect(status).toHaveBeenCalledExactlyOnceWith(HttpStatus.CONFLICT);
    expect(getResponseBody(json).data).toEqual(
      expect.objectContaining({
        message: "A product with this SKU already exists.",
      }),
    );
  });

  test("maps missing product database errors to not found responses", () => {
    const { host, json, status } = createHttpHost();
    const filter = createFilter();

    filter.catch({ code: "P2025", message: "Record not found" }, host);

    expect(status).toHaveBeenCalledExactlyOnceWith(HttpStatus.NOT_FOUND);
    expect(getResponseBody(json).data).toEqual(
      expect.objectContaining({
        message:
          "We could not find this product. It may have already been removed.",
      }),
    );
  });
});

const createFilter = () => {
  rs.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
  rs.spyOn(Logger.prototype, "debug").mockImplementation(() => undefined);

  return new HttpExceptionFilter();
};

const createHttpHost = () => {
  const json = rs.fn();
  const status = rs.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ url: requestPath }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, json, status };
};

const getResponseBody = (json: ReturnType<typeof rs.fn>) =>
  json.mock.calls[0]?.[0] as ResponseBody;
