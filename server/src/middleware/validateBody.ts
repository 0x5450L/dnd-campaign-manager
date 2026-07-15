import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      res.status(400).json({
        status: "error",
        error: {
          message: "Invalid request body",
          statusCode: 400,
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
