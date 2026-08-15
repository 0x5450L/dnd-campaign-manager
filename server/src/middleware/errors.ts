import { AppError } from "../utils/errors";
import { type NextFunction, type Request, type Response } from "express";

export const errorMiddleware = (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      error: { message: err.message, statusCode: err.statusCode },
    });
    return;
  }
  console.error(`[${req.method} ${req.originalUrl}] Unhandled error:`, err);
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({
    status: 'error',
    message: message || 'Internal Server Error',
    error: { message: message || 'Internal Server Error', statusCode: 500 },
  });
}
