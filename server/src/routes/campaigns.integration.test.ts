import { describe, expect, it } from "vitest";
import prisma from "../services/prisma";
import { asUser, createCampaign, registerUser } from "../testing/factories";

describe("POST /api/campaigns/create", () => {
  it("creates the campaign and the DM membership together", async () => {
    const dm = await registerUser("Dungeon Master");
    const campaign = await createCampaign(dm, "Curse of Strahd");

    const members = await prisma.campaignMember.findMany({
      where: { campaignId: campaign.id },
    });
    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({ userId: dm.id, role: "dm" });
  });

  it("leaves nothing behind when the name collides", async () => {
    const dm = await registerUser();
    await createCampaign(dm, "Curse of Strahd");

    const response = await asUser(dm)
      .post("/api/campaigns/create")
      .send({ name: "Curse of Strahd" });

    expect(response.status).toBe(409);
    expect(await prisma.campaign.count()).toBe(1);
    expect(await prisma.campaignMember.count()).toBe(1);
  });

  it("lets a different DM reuse the same campaign name", async () => {
    const first = await registerUser("First");
    const second = await registerUser("Second");

    await createCampaign(first, "Curse of Strahd");
    const response = await asUser(second)
      .post("/api/campaigns/create")
      .send({ name: "Curse of Strahd" });

    expect(response.status).toBe(200);
  });

  it("rejects an unbounded name", async () => {
    const dm = await registerUser();
    const response = await asUser(dm)
      .post("/api/campaigns/create")
      .send({ name: "x".repeat(10_000) });

    expect(response.status).toBe(400);
    expect(await prisma.campaign.count()).toBe(0);
  });

  it("rejects an unbounded description", async () => {
    const dm = await registerUser();
    const response = await asUser(dm)
      .post("/api/campaigns/create")
      .send({ name: "Fine", description: "x".repeat(100_000) });

    expect(response.status).toBe(400);
  });

  it("refuses an anonymous caller", async () => {
    const response = await asUser({
      id: "",
      email: "",
      displayName: "",
      token: "not-a-token",
    })
      .post("/api/campaigns/create")
      .send({ name: "Anything" });

    expect(response.status).toBe(401);
  });
});

describe("GET /api/campaigns/:id", () => {
  it("hides a campaign the caller does not belong to", async () => {
    const dm = await registerUser("Dungeon Master");
    const outsider = await registerUser("Passerby");
    const campaign = await createCampaign(dm);

    const response = await asUser(outsider).get(`/api/campaigns/${campaign.id}`);
    expect(response.status).toBe(404);
  });
});
