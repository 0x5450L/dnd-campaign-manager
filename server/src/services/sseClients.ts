import type { Request, Response } from "express";

const clients = new Map<string, Response[]>();

export const addClient = (email: string, res: Response) => {
  const existing = clients.get(email) || [];
  existing.push(res);
  clients.set(email, existing);
};

export const removeClient = (email: string, res: Response) => {
  const existing = clients.get(email) || [];
  clients.set(email, existing.filter((c) => c !== res));
};

export const notifyClient = (email: string, data: any) => {
  const clientList = clients.get(email) || [];
  clientList.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

export const openSseStream = (req: Request, res: Response, email: string) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(`\n`);

  addClient(email, res);
  req.on("close", () => {
    removeClient(email, res);
  });
};
