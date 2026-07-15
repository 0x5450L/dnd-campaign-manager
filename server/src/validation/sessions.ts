import { z } from "zod";
import type {
  CreateSessionPayload,
  UpdateSessionPayload,
} from "../../../shared/dto/session";

export const createSessionSchema = z.object({
  campaignId: z.string().min(1),
  title: z.string().optional(),
}) satisfies z.ZodType<CreateSessionPayload>;

export const updateSessionSchema = z
  .object({
    status: z.enum(["active", "paused", "ended"]),
    title: z.string(),
    summary: z.string(),
    notes: z.string(),
  })
  .partial() satisfies z.ZodType<UpdateSessionPayload>;
