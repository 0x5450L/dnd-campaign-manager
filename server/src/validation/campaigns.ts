import { z } from "zod";
import { TEXT_LIMITS } from "../constants/limits";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../services/campaigns/campaignsRepository";

/**
 * `imageUrl` is accepted but no client sends it: the URL input was removed from the UI.
 * The field stays as the seam for a future image-upload flow, where the server will
 * assign the URL after storing the file rather than trusting a client-supplied one.
 */

const name = z.string().min(1).max(TEXT_LIMITS.Name);
const description = z.string().max(TEXT_LIMITS.Paragraph).nullable().optional();
const setting = z.string().max(TEXT_LIMITS.Paragraph).nullable().optional();
const imageUrl = z.string().max(TEXT_LIMITS.ShortText).nullable().optional();

export const createCampaignSchema = z.object({
  name,
  description,
  setting,
  imageUrl,
}) satisfies z.ZodType<CreateCampaignInput>;

export const updateCampaignSchema = z.object({
  name: name.optional(),
  description,
  setting,
  imageUrl,
}) satisfies z.ZodType<UpdateCampaignInput>;
