import { z } from "zod";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../services/campaigns/campaignsRepository";

/**
 * `imageUrl` is accepted but no client sends it: the URL input was removed from the UI.
 * The field stays as the seam for a future image-upload flow, where the server will
 * assign the URL after storing the file rather than trusting a client-supplied one.
 */

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  setting: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
}) satisfies z.ZodType<CreateCampaignInput>;

export const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  setting: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
}) satisfies z.ZodType<UpdateCampaignInput>;
