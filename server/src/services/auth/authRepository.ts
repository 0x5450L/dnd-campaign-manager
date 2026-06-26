import prisma from "../prisma";

export const createUser = (
  email: string,
  passwordHash: string,
  displayName: string,
) => prisma.user.create({ data: { email, passwordHash, displayName } });

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });
