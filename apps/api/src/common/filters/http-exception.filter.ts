import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("HttpExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
    }
    // Handle Prisma errors mapping
    else if ((exception as any)?.code?.startsWith('P2')) { 
      status = HttpStatus.BAD_REQUEST;
      const code = (exception as any).code;
      const target = ((exception as any)?.meta?.target as string[])?.join(", ") || "field";
      
      switch (code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `A record with this ${target} already exists.`;
          break;
        case 'P2003':
          message = `Foreign key constraint failed on ${target}.`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = "The requested record was not found.";
          break;
        default:
          message = `Database error (${code}): ${(exception as any).message || 'Unknown database error'}`;
      }
    }
    // Handle JWT & Token errors
    else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.name} - ${exception.message}`, exception.stack);

      if (exception.name === 'TokenExpiredError') {
        status = HttpStatus.UNAUTHORIZED;
        message = "Session expired. Please log in again.";
      } else if (exception.name === 'JsonWebTokenError') {
        status = HttpStatus.UNAUTHORIZED;
        message = "Invalid authentication token.";
      } else {
        const errorName = exception.constructor.name || exception.name;
        message = process.env.NODE_ENV === "development"
          ? exception.message
          : `Internal server error (${errorName})`;
      }
    }

    // Flatten Zod arrays if any and format the raw message
    const finalMessage = typeof message === "string"
      ? message
      : (Array.isArray(message) ? message[0] : (message as any)?.message || "Internal server error");

    this.logger.error(
      `Http Status: ${status} Error: ${finalMessage}`,
      status === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error ? exception.stack : "",
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: finalMessage,
    });
  }
}
