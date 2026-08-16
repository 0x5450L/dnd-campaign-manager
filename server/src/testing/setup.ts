import { createServer } from "node:http";
import { afterAll, beforeEach } from "vitest";
import prisma from "../services/prisma";
import { initSocket } from "../services/socket";
import { resetDatabase } from "./db";

const io = initSocket(createServer());

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await io.close();
  await prisma.$disconnect();
});
