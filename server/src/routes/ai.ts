import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validateBody";
import { asyncHandler } from "../utils/asyncHandler";
import {
  generateEncounterSchema,
  generateLootSchema,
  type GenerateEncounterBody,
  type GenerateLootBody,
} from "../validation/ai";
import { getAiConfig, getAiService } from "../services/ai";

const router = Router();

const aiRateLimit = createRateLimit({
  ...getAiConfig().rateLimit,
  message: "Too many AI requests, wait a moment before generating again",
});

router.post(
  "/loot",
  authMiddleware,
  aiRateLimit,
  validateBody(generateLootSchema),
  asyncHandler<ParamsDictionary, unknown, GenerateLootBody>(async (req, res) => {
    const generation = await getAiService().generateLoot(req.userId!, req.body);
    res.json({ status: "ok", generation });
  }),
);

router.post(
  "/encounter",
  authMiddleware,
  aiRateLimit,
  validateBody(generateEncounterSchema),
  asyncHandler<ParamsDictionary, unknown, GenerateEncounterBody>(
    async (req, res) => {
      const generation = await getAiService().generateEncounter(
        req.userId!,
        req.body,
      );
      res.json({ status: "ok", generation });
    },
  ),
);

export default router;
