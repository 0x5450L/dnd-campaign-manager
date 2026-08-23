import type { Request, Response } from "express";

const clients = new Map<string, Response[]>();

const addClient = (email: string, res: Response) => {
  const existing = clients.get(email) || [];
  existing.push(res);
  clients.set(email, existing);
};

const removeClient = (email: string, res: Response) => {
  const existing = clients.get(email) || [];
  clients.set(email, existing.filter((c) => c !== res));
};

export const notifyClient = (email: string, data: { type: string } & Record<string, unknown>) => {
  const clientList = clients.get(email) || [];
  clientList.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

const PROXY_IDLE_TIMEOUT_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = PROXY_IDLE_TIMEOUT_MS / 2;

export const openSseStream = (req: Request, res: Response, email: string) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  res.write(`\n`);

  addClient(email, res);

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, HEARTBEAT_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(email, res);
  });
};
