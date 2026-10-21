import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

import type { Response, Request } from "express";
import { ExceptionSchema } from "~/utils/exception.schema";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const payload: Partial<ExceptionSchema> = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: [],
    };

    if (exception instanceof Error) {
      exception.message.toLowerCase();

      this.logger.error(exception.message, exception.stack);

      payload.message = exception.message;
    }

    if (exception instanceof HttpException) {
      payload.statusCode = exception.getStatus();
      const response = exception.getResponse() as Record<string, string>;
      payload.message =
        typeof response === "string" ? response : response["message"];
    }

    response.status(payload.statusCode!).json({
      statusCode: payload.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: payload.message,
    });
  }
}
