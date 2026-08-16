import { randomUUID } from "node:crypto";
import request from "supertest";
import { createApp } from "../app";
import prisma from "../services/prisma";

export const app = createApp();

export type TestUser = {
  id: string;
  email: string;
  displayName: string;
  token: string;
};

export const registerUser = async (displayName = "Tester"): Promise<TestUser> => {
  const email = `${randomUUID()}@example.test`;
  const response = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "correct-horse-battery", displayName });

  if (response.status !== 200) {
    throw new Error(`registerUser failed: ${response.status} ${response.text}`);
  }

  return { ...response.body.user, token: response.body.token };
};

export const createCampaign = async (dm: TestUser, name = "Test Campaign") => {
  const response = await request(app)
    .post("/api/campaigns/create")
    .set("Authorization", `Bearer ${dm.token}`)
    .send({ name });

  if (response.status !== 200) {
    throw new Error(`createCampaign failed: ${response.status} ${response.text}`);
  }

  return response.body.campaign as { id: string; name: string; dmId: string };
};

export const addPlayerToCampaign = async (campaignId: string, player: TestUser) => {
  await prisma.campaignMember.create({
    data: { campaignId, userId: player.id, role: "player" },
  });
};

export const createCharacter = async (
  campaignId: string,
  owner: TestUser,
  name = "Player Character",
) =>
  prisma.character.create({
    data: { campaignId, userId: owner.id, name, race: "human", type: "player" },
  });

export const createSession = async (campaignId: string) =>
  prisma.campaignSession.create({ data: { campaignId, number: 1, status: "active" } });

export const createEncounter = async (
  campaignSessionId: string,
  status: "setup" | "active" = "active",
) => prisma.encounter.create({ data: { campaignSessionId, status } });

type ParticipantOverrides = {
  name?: string;
  characterId?: string | null;
  type?: "pc" | "npc" | "monster";
  isVisible?: boolean;
  sortOrder?: number;
  currentHp?: number;
  maxHp?: number;
  armorClass?: number;
};

export const createParticipant = async (
  encounterId: string,
  overrides: ParticipantOverrides = {},
) =>
  prisma.encounterParticipant.create({
    data: {
      encounterId,
      type: overrides.type ?? "monster",
      name: overrides.name ?? "Goblin",
      sortOrder: overrides.sortOrder ?? 0,
      maxHp: overrides.maxHp ?? 10,
      currentHp: overrides.currentHp ?? 10,
      armorClass: overrides.armorClass ?? 13,
      characterId: overrides.characterId ?? null,
      isVisible: overrides.isVisible ?? true,
    },
  });

export const asUser = (user: TestUser) => ({
  get: (url: string) => request(app).get(url).set("Authorization", `Bearer ${user.token}`),
  post: (url: string) => request(app).post(url).set("Authorization", `Bearer ${user.token}`),
  patch: (url: string) =>
    request(app).patch(url).set("Authorization", `Bearer ${user.token}`),
  delete: (url: string) =>
    request(app).delete(url).set("Authorization", `Bearer ${user.token}`),
});
