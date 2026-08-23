import { Router } from "express";

import { config } from "../config";
import prisma from "../services/prisma";

const router = Router();

/**
 * Liveness, not readiness: it reports that the process is up and answering, and
 * deliberately does not touch the database. A platform health check that fails
 * on a database outage would restart the container in a loop, which cannot fix
 * a database outage and removes the one thing still able to serve the client.
 */
router.get("", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    version: config.buildVersion,
  });
});

/**
 * Readiness, and the mirror image of the route above: this one does touch the
 * database, and nothing platform-side probes it. The deployment workflow polls it
 * to decide whether the new task is serving rather than merely running, which is
 * a question liveness is deliberately unable to answer.
 */
router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`select 1`;
    res.json({ status: "ready", version: config.buildVersion });
  } catch {
    res.status(503).json({ status: "unavailable", version: config.buildVersion });
  }
});

export default router;
