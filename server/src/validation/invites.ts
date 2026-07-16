import { z } from "zod";

export const createInviteSchema = z.object({
  email: z.string().email().optional(),
  campaignId: z.string().min(1),
});

export const respondToInviteSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type CreateInviteBody = z.infer<typeof createInviteSchema>;
export type RespondToInviteBody = z.infer<typeof respondToInviteSchema>;
