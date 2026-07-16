import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validateBody";
import type {
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "@shared/dto/character";
import {
  createCharacterSchema,
  updateCharacterSchema,
} from "../validation/characters";
import * as charactersService from "../services/characters/charactersService";

const router = Router();

router.post("/create", authMiddleware, validateBody(createCharacterSchema), asyncHandler<ParamsDictionary, unknown, CreateCharacterPayload>(async (req, res) => {
  const character = await charactersService.createCharacter(req.userId!, req.body);
  res.json({ status: "ok", message: "Character created successfully", character });
}));

router.get<{ campaignId: string }>(
  "/campaign-characters/:campaignId",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const characters = await charactersService.listCampaignCharacters(
      req.userId!,
      req.params.campaignId,
    );
    res.json({ status: "ok", message: "Characters retrieved successfully", characters });
  }),
);

router.patch<{ id: string }>("/:id", authMiddleware, validateBody(updateCharacterSchema), asyncHandler<{ id: string }, unknown, UpdateCharacterPayload>(async (req, res) => {
  const character = await charactersService.updateCharacter(
    req.userId!,
    req.params.id,
    req.body,
  );
  res.json({ status: "ok", message: "Character updated successfully", character });
}));

router.delete<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const character = await charactersService.deleteCharacter(req.userId!, req.params.id);
  res.json({ status: "ok", message: "You have lost your friend...", character });
}));

router.get<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const character = await charactersService.getCharacter(req.userId!, req.params.id);
  res.json({ status: "ok", message: "Character retrieved successfully", character });
}));

export default router;
