import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma';
import { generateToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    throw new AppError(400, 'Email, password and name are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      displayName: displayName,
    },
  });
  const token = generateToken(createdUser.id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // TODO: change to true in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ status: 'ok', message: 'User created successfully', user: { email, displayName, id: createdUser.id }, token });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // TODO: change to true in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ status: 'ok', message: 'Login successful', user: { email, displayName: user.displayName, id: user.id }, token });
}));

router.post('/logout', async (req, res) => {
  res.clearCookie('token');
  res.json({ status: 'ok', message: 'Logout successful' });
});

export default router;
