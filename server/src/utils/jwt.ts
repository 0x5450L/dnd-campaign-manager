import jwt from 'jsonwebtoken';


export const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export const verifyToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  return decoded.userId;
}