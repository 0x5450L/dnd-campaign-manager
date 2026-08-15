import { verifyToken } from "../utils/jwt";
import { type NextFunction, type Request, type Response } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.cookies?.token ||
    (typeof req.query.token === 'string' ? req.query.token : undefined);
  if (!token) {
    return res.status(401).json({ status: 'error', error: { message: 'Unauthorized', statusCode: 401 } });
  }

  try {
    const userId = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ status: 'error', error: { message: 'Unauthorized', statusCode: 401 } });
  }
}