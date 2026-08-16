import { z } from "zod";
import { TEXT_LIMITS } from "../constants/limits";

const MIN_PASSWORD_LENGTH = 8;

/**
 * bcrypt silently ignores anything past 72 bytes, so a longer password would be
 * accepted at registration and only partly checked at login. Rejecting it is
 * honest; raising the ceiling would mean pre-hashing.
 */
const MAX_PASSWORD_LENGTH = 72;

export const registerSchema = z.object({
  email: z.string().email().max(TEXT_LIMITS.ShortText),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  displayName: z.string().min(1).max(TEXT_LIMITS.Name),
});

export const loginSchema = z.object({
  email: z.string().min(1).max(TEXT_LIMITS.ShortText),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
