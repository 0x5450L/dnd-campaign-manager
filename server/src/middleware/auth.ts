import { verifyToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const userId = verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
}