import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { getReferenceService } from "../services/reference";

const router = Router();

const parseLimit = (raw: unknown): number | undefined => {
  if (typeof raw !== "string" || raw.trim() === "") {
    return undefined;
  }
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < 1) {
    return undefined;
  }
  return Math.min(value, 50);
};

const parseOffset = (raw: unknown): number | undefined => {
  if (typeof raw !== "string" || raw.trim() === "") {
    return undefined;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) || value < 0 ? undefined : value;
};

router.get(
  "/monsters",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const page = await getReferenceService().searchMonsters({
      search,
      limit: parseLimit(req.query.limit),
      offset: parseOffset(req.query.offset),
    });
    res.json(page);
  }),
);

router.get<{ slug: string }>(
  "/monsters/:slug",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const monster = await getReferenceService().getMonster(slug);
    if (!monster) {
      throw new AppError(404, "Monster not found");
    }
    res.json(monster);
  }),
);

export default router;
