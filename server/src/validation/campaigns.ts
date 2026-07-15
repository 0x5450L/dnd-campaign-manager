import { z } from "zod";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../services/campaigns/campaignsRepository";

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
