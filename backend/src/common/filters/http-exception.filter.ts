import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionBody {
  code?: string;
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let code = 'INTERNAL_ERROR';
    let normalizedMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      if (typeof body === 'string') {
        // e.g. new HttpException('Not found', 404)
        normalizedMessage = body;
        code = this.statusToCode(status);
      } else {
        const typedBody = body as HttpExceptionBody;
        // Prefer explicit code field, fall back to status-derived code
        code = typedBody.code ?? this.statusToCode(status);
        const raw = typedBody.message;
        normalizedMessage = Array.isArray(raw)
          ? raw[0]
          : (raw ?? typedBody.error ?? exception.message);
      }
    }

    this.logger.warn(
      `${request.method} ${request.url} → ${status} [${code}] ${normalizedMessage}`,
    );

    response.status(status).json({
      error: {
        code,
        message: normalizedMessage,
        details: {},
      },
    });
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] ?? `HTTP_${status}`;
  }
}
