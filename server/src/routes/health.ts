import { Router } from "express";

const router = Router();

/**
 * Liveness, not readiness: it reports that the process is up and answering, and
 * deliberately does not touch the database. A platform health check that fails
 * on a database outage would restart the container in a loop, which cannot fix
 * a database outage and removes the one thing still able to serve the client.
 */
router.get("", (_req, res) => {
  res.json({ status: "ok", uptime: Math.floor(process.uptime()) });
});

export default router;
