import { AppError } from "../utils/errors";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'error', error: err });
  } else {
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
}