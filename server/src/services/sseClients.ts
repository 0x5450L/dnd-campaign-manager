import type { Response } from "express";

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