import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";
import { type NextFunction, type Request, type Response } from "express";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

const respond = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({
    status: "error",
    message,
    error: { message, statusCode },
  });
};

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    respond(res, err.statusCode, err.message);
    return;
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === UNIQUE_CONSTRAINT_VIOLATION
  ) {
    respond(res, 409, "That value is already taken");
    return;
  }

  console.error(`[${req.method} ${req.originalUrl}] Unhandled error:`, err);
  respond(res, 500, "Internal Server Error");
};
