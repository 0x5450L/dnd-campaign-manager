import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        displayName: name,
      },
    });
    res.json({ status: 'ok', message: 'User created successfully', user: { email, name, id: createdUser.id } });
  } catch (error: any) {
    switch (error.code) {
      case 'P2002':
        res.status(409).json({ status: 'error', message: 'User already exists' });
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

    res.json({ status: 'ok', message: 'Login successful', user: { email, name: user.displayName, id: user.id } });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Login failed', error: error.message });
  }
});

export default router;