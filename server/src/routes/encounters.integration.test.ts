import { beforeEach, describe, expect, it } from "vitest";
import prisma from "../services/prisma";
import {
  addPlayerToCampaign,
  asUser,
  createCampaign,
  createCharacter,
  createEncounter,
  createParticipant,
  createSession,
  registerUser,
  type TestUser,
} from "../testing/factories";

type Fixture = {
  dm: TestUser;
  player: TestUser;
  outsider: TestUser;
  encounterId: string;
  ownParticipantId: string;
  otherPlayerParticipantId: string;
  monsterId: string;
  hiddenMonsterId: string;
};

let f: Fixture;

beforeEach(async () => {
  const dm = await registerUser("Dungeon Master");
  const player = await registerUser("Mira");
  const otherPlayer = await registerUser("Borin");
  const outsider = await registerUser("Passerby");

  const campaign = await createCampaign(dm);
  await addPlayerToCampaign(campaign.id, player);
  await addPlayerToCampaign(campaign.id, otherPlayer);

  const session = await createSession(campaign.id);
  const encounter = await createEncounter(session.id);

  const ownCharacter = await createCharacter(campaign.id, player, "Mira");
  const otherCharacter = await createCharacter(campaign.id, otherPlayer, "Borin");

  const own = await createParticipant(encounter.id, {
    type: "pc",
    name: "Mira",
    characterId: ownCharacter.id,
    sortOrder: 0,
  });
  const other = await createParticipant(encounter.id, {
    type: "pc",
    name: "Borin",
    characterId: otherCharacter.id,
    sortOrder: 1,
  });
  const monster = await createParticipant(encounter.id, { name: "Goblin", sortOrder: 2 });
  const hidden = await createParticipant(encounter.id, {
    name: "Ambusher",
    sortOrder: 3,
    isVisible: false,
  });

  f = {
    dm,
    player,
    outsider,
    encounterId: encounter.id,
    ownParticipantId: own.id,
    otherPlayerParticipantId: other.id,
    monsterId: monster.id,
    hiddenMonsterId: hidden.id,
  };
});

describe("participant visibility", () => {
  it("shows the DM every participant, hidden ones included", async () => {
    const response = await asUser(f.dm).get(`/api/encounters/${f.encounterId}`);

    expect(response.status).toBe(200);
    const names = response.body.encounter.participants.map((p: { name: string }) => p.name);
    expect(names).toContain("Ambusher");
  });

  it("hides participants marked invisible from players", async () => {
    const response = await asUser(f.player).get(`/api/encounters/${f.encounterId}`);

    expect(response.status).toBe(200);
    const names = response.body.encounter.participants.map((p: { name: string }) => p.name);
    expect(names).toContain("Goblin");
    expect(names).not.toContain("Ambusher");
  });

  it("hides the encounter entirely from a non-member", async () => {
    const response = await asUser(f.outsider).get(`/api/encounters/${f.encounterId}`);
    expect(response.status).toBe(404);
  });

  it("hides an encounter still in setup from players", async () => {
    await prisma.encounter.update({
      where: { id: f.encounterId },
      data: { status: "setup" },
    });

    expect((await asUser(f.player).get(`/api/encounters/${f.encounterId}`)).status).toBe(404);
    expect((await asUser(f.dm).get(`/api/encounters/${f.encounterId}`)).status).toBe(200);
  });
});

describe("who may edit a participant", () => {
  const patch = (user: TestUser, participantId: string, body: object) =>
    asUser(user)
      .patch(`/api/encounters/${f.encounterId}/participants/${participantId}`)
      .send(body);

  it("lets the DM edit any participant", async () => {
    const response = await patch(f.dm, f.monsterId, { currentHp: 3 });

    expect(response.status).toBe(200);
    expect(response.body.participant.currentHp).toBe(3);
  });

  it("lets a player edit the participant backed by their own character", async () => {
    const response = await patch(f.player, f.ownParticipantId, { currentHp: 7 });

    expect(response.status).toBe(200);
    expect(response.body.participant.currentHp).toBe(7);
  });

  it("refuses a player editing another player's character", async () => {
    const response = await patch(f.player, f.otherPlayerParticipantId, { currentHp: 1 });

    expect(response.status).toBe(403);
    const untouched = await prisma.encounterParticipant.findUnique({
      where: { id: f.otherPlayerParticipantId },
    });
    expect(untouched?.currentHp).toBe(10);
  });

  it("refuses a player editing a monster", async () => {
    const response = await patch(f.player, f.monsterId, { currentHp: 1 });
    expect(response.status).toBe(403);
  });

  it("refuses a non-member outright", async () => {
    const response = await patch(f.outsider, f.ownParticipantId, { currentHp: 1 });
    expect(response.status).toBe(403);
  });

  it("rejects a participant id from another encounter", async () => {
    const otherSession = await createSession((await createCampaign(f.dm, "Second")).id);
    const otherEncounter = await createEncounter(otherSession.id);
    const stranger = await createParticipant(otherEncounter.id);

    const response = await patch(f.dm, stranger.id, { currentHp: 1 });
    expect(response.status).toBe(404);
  });
});

describe("fields only the DM may change", () => {
  const patch = (user: TestUser, participantId: string, body: object) =>
    asUser(user)
      .patch(`/api/encounters/${f.encounterId}/participants/${participantId}`)
      .send(body);

  it("ignores isVisible coming from a player", async () => {
    const response = await patch(f.player, f.ownParticipantId, {
      currentHp: 4,
      isVisible: false,
    });

    expect(response.status).toBe(200);
    expect(response.body.participant.currentHp).toBe(4);
    expect(response.body.participant.isVisible).toBe(true);
  });

  it("ignores acHidden and typeHidden coming from a player", async () => {
    await patch(f.player, f.ownParticipantId, { acHidden: true, typeHidden: true });

    const stored = await prisma.encounterParticipant.findUnique({
      where: { id: f.ownParticipantId },
    });
    expect(stored?.acHidden).toBe(false);
    expect(stored?.typeHidden).toBe(false);
  });

  it("applies isVisible when the DM sends it", async () => {
    const response = await patch(f.dm, f.monsterId, { isVisible: false });

    expect(response.status).toBe(200);
    expect(response.body.participant.isVisible).toBe(false);
  });
});

describe("who may delete a participant", () => {
  it("lets the DM remove a participant", async () => {
    const response = await asUser(f.dm).delete(
      `/api/encounters/${f.encounterId}/participants/${f.monsterId}`,
    );

    expect(response.status).toBe(200);
    expect(
      await prisma.encounterParticipant.findUnique({ where: { id: f.monsterId } }),
    ).toBeNull();
  });

  it("refuses a player removing their own participant", async () => {
    const response = await asUser(f.player).delete(
      `/api/encounters/${f.encounterId}/participants/${f.ownParticipantId}`,
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(
      await prisma.encounterParticipant.findUnique({ where: { id: f.ownParticipantId } }),
    ).not.toBeNull();
  });
});

describe("advancing the turn", () => {
  it("is refused for a player", async () => {
    const response = await asUser(f.player).post(
      `/api/encounters/${f.encounterId}/next-turn`,
    );
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("walks the DM through every participant, hidden ones included", async () => {
    const seen: string[] = [];
    for (let turn = 0; turn < 4; turn++) {
      const response = await asUser(f.dm).post(`/api/encounters/${f.encounterId}/next-turn`);
      expect(response.status).toBe(200);
      seen.push(response.body.encounter.currentParticipantId);
    }

    expect(seen).toContain(f.hiddenMonsterId);
  });
});
