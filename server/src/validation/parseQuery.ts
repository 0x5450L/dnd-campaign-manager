import type { ZodType, ZodTypeDef } from "zod";
import { AppError } from "../utils/errors";

export const parseQuery = <T>(
  schema: ZodType<T, ZodTypeDef, unknown>,
  query: unknown,
): T => {
  const result = schema.safeParse(query);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) =>
        issue.path.length
          ? `${issue.path.join(".")}: ${issue.message}`
          : issue.message,
      )
      .join("; ");
    throw new AppError(400, `Invalid query params: ${detail}`);
  }
  return result.data;
};
