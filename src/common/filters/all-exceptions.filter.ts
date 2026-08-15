import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number | HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Handle TypeORM DB errors (e.g. unique constraint violations)
    if (exception instanceof QueryFailedError) {
      const err: any = exception;
      // Postgres duplicate key error code
      const driverCode = err.driverError?.code ?? err.code;
      if (driverCode === '23505') {
        status = HttpStatus.CONFLICT;
        message =
          err.detail || 'Duplicate key value violates unique constraint';
        this.logger.warn(`DB conflict: ${message}`);
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = err.message || 'Database query failed';
        this.logger.error(`DB error: ${err.message}`, err.stack);
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled exception: ${(exception as Error)?.message}`,
        (exception as Error)?.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: typeof message === 'string' ? message : (message as any).message,
    });
  }
}
