import { Prisma } from "@prisma/client";

export const jsonInput = <T>(
  value: T | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.DbNull;
  return value as unknown as Prisma.InputJsonValue;
};

export const pickDefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const trimOrNull = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.trim();
};
