import { z } from "zod";
import { TEXT_LIMITS } from "../constants/limits";
import type {
  CreateSessionPayload,
  UpdateSessionPayload,
} from "@dnd/shared/dto/session";

export const createSessionSchema = z.object({
  campaignId: z.string().min(1).max(TEXT_LIMITS.ShortText),
  title: z.string().max(TEXT_LIMITS.Name).optional(),
}) satisfies z.ZodType<CreateSessionPayload>;

export const updateSessionSchema = z
  .object({
    status: z.enum(["active", "paused", "ended"]),
    title: z.string().max(TEXT_LIMITS.Name),
    summary: z.string().max(TEXT_LIMITS.Paragraph),
    notes: z.string().max(TEXT_LIMITS.Notes),
  })
  .partial() satisfies z.ZodType<UpdateSessionPayload>;
