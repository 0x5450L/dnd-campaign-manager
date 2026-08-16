import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1d' });

export const verifyToken = (token: string) => {
  const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
  return decoded.userId;
};
