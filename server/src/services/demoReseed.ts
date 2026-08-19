import { config } from "../config";
import { seedDemoData } from "../prisma/seed";
import { getIo } from "./socket";

const HOUR_MS = 60 * 60 * 1000;

const someoneIsConnected = () => {
  try {
    return getIo().sockets.sockets.size > 0;
  } catch {
    return false;
  }
};

/**
 * The demo campaign is shared, so visitors leave it in whatever state they
 * played it into, and an unattended live session is closed by the staleness
 * check within the hour — taking the prepared encounter out of view. Reseeding
 * on a timer puts the scene back.
 *
 * It skips while anyone is connected rather than yanking the campaign out from
 * under them; the next tick will catch it.
 */
export const startDemoReseed = () => {
  if (!config.demoReseedHours) return;

  const intervalMs = config.demoReseedHours * HOUR_MS;

  const timer = setInterval(() => {
    if (someoneIsConnected()) return;

    seedDemoData()
      .then(() => console.log("demo data reseeded"))
      .catch((error) => console.error("demo reseed failed", error));
  }, intervalMs);

  timer.unref();

  console.log(`Demo reseed scheduled every ${config.demoReseedHours}h`);
};
