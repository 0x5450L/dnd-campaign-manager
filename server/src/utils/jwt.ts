import jwt from 'jsonwebtoken';
import { config } from '../config';
import { SESSION_TTL_SECONDS } from '../constants/session';

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: SESSION_TTL_SECONDS });

export const verifyToken = (token: string) => {
  const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
  return decoded.userId;
};
