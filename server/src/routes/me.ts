import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { Router } from "express";

const router = Router();

router.get('', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    res.json({ status: 'ok', message: 'User information', user: { email: user.email, name: user.displayName, id: user.id } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'User information failed', error: error.message });
  }
});

export default router;