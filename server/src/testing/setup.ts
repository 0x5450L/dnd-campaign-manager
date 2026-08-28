import { createServer } from "node:http";
import { afterAll, beforeEach } from "vitest";
import { resetRateLimits } from "../middleware/rateLimit";
import prisma from "../services/prisma";
import { initSocket } from "../services/socket";
import { resetDatabase } from "./db";

const io = initSocket(createServer());

beforeEach(async () => {
  resetRateLimits();
  await resetDatabase();
});

afterAll(async () => {
  await io.close();
  await prisma.$disconnect();
});
