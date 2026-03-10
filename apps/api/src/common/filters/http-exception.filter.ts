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
    else if ((exception as any)?.code === 'P2002') { // Prisma Client Known Request Error (Unique Constraint)
      status = HttpStatus.CONFLICT;
      const target = ((exception as any)?.meta?.target as string[])?.join(", ") || "field";
      message = `This ${target} is already in use.`;
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
        // In production, give a slightly more useful hint for 500s that still hides sensitive paths
        message = process.env.NODE_ENV === "development"
          ? exception.message
          : `Internal server error (${exception.name})`;
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
