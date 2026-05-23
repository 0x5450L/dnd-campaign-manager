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
