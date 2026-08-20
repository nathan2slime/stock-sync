import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { Request, Response } from "express";

const duplicateProductSkuMessage = "A product with this SKU already exists.";
const productNotFoundMessage =
  "We could not find this product. It may have already been removed.";

type DatabaseErrorWithCode = {
  code?: unknown;
};

type ErrorWithMessage = {
  message?: unknown;
};

type ErrorWithStack = {
  stack?: unknown;
};

const hasDatabaseErrorCode = (error: unknown): error is DatabaseErrorWithCode =>
  typeof error === "object" && error !== null && "code" in error;

const hasErrorMessage = (error: unknown): error is ErrorWithMessage =>
  typeof error === "object" && error !== null && "message" in error;

const hasErrorStack = (error: unknown): error is ErrorWithStack =>
  typeof error === "object" && error !== null && "stack" in error;

const getDatabaseErrorCode = (error: unknown) => {
  if (hasDatabaseErrorCode(error)) {
    const { code } = error;

    if (typeof code === "string") {
      return code;
    }
  }

  return null;
};

const getExceptionMessage = (exception: unknown) => {
  if (hasErrorMessage(exception) && typeof exception.message === "string") {
    return exception.message;
  }

  return "Unexpected application error";
};

const getExceptionStack = (exception: unknown) => {
  if (hasErrorStack(exception) && typeof exception.stack === "string") {
    return exception.stack;
  }

  return undefined;
};

const getHttpException = (exception: unknown) => {
  if (exception instanceof HttpException) {
    return exception;
  }

  const code = getDatabaseErrorCode(exception);

  if (code === "P2002") {
    return new ConflictException(duplicateProductSkuMessage);
  }

  if (code === "P2025") {
    return new NotFoundException(productNotFoundMessage);
  }

  return new InternalServerErrorException(
    "The system is having trouble right now. Please try again in a moment.",
  );
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<unknown> {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const httpException = getHttpException(exception);
    const status = httpException.getStatus();
    const data = httpException.getResponse();

    this.logger.error(
      getExceptionMessage(exception),
      getExceptionStack(exception),
    );
    this.logger.debug(data);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      data,
    });
  }
}
