import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Общий перехватчик, буду использовать не глобально через AppModule, а под нужные контроллеры
@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let errorMessage = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorMessage = exception.message;
    }

    this.logger.error(
      `HTTP Status: ${status}, Error Message: ${errorMessage}, Path: ${request.url}, Method: ${request.method}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorMessage,
    });
  }
}
