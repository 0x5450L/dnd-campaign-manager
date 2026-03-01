import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma';
import { generateToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      res.status(400).json({ status: 'error', message: 'Email, password and name are required' });
      return;
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
    res.json({ status: 'ok', message: 'User created successfully', user: { email, displayName, id: createdUser.id }, token });
  } catch (error: any) {
    switch (error.code) {
      case 'P2002':
        res.status(409).json({ status: 'error', message: 'User already exists', error: error.message });
        break;
      default:
        res.status(500).json({ status: 'error', message: 'User creation failed', error: error.message });
        break;
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);

    res.json({ status: 'ok', message: 'Login successful', user: { email, displayName: user.displayName, id: user.id }, token });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Login failed', error: error.message });
  }
});

export default router;