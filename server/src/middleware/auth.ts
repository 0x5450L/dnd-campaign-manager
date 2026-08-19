import { verifyToken } from "../utils/jwt";
import { type NextFunction, type Request, type Response } from "express";

/**
 * Deliberately no query-parameter fallback. EventSource cannot set headers, which
 * is why the token used to travel in the URL — and URLs are logged by proxies,
 * kept in history and sent in referrers. The SSE stream authenticates with the
 * cookie the browser attaches on its own.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
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