import { z } from "zod";
import type { JsonSchemaNode } from "../providers/aiProvider";

export const buildLootOutputSchema = (candidateSlugs: string[]) => {
  const slugs = new Set(candidateSlugs);
  return z.object({
    readAloud: z.string().trim().min(20).max(1200),
    items: z
      .array(
        z.object({
          slug: z
            .string()
            .trim()
            .refine((slug) => slugs.has(slug), {
              message: "slug is not one of the offered candidates",
            }),
          note: z.string().trim().min(10).max(400),
        }),
      )
      .min(1)
      .max(10)
      .refine(
        (items) => new Set(items.map((item) => item.slug)).size === items.length,
        { message: "the same item was picked more than once" },
      ),
  });
};

export type LootModelOutput = z.infer<ReturnType<typeof buildLootOutputSchema>>;

export const buildLootResponseSchema = (
  itemCount: number,
  candidateSlugs: string[],
): JsonSchemaNode => ({
  type: "object",
  properties: {
    readAloud: {
      type: "string",
      description:
        "One or two paragraphs the DM reads aloud at the table describing the find and the items in it. No markdown, no bullet points, no game statistics.",
    },
    items: {
      type: "array",
      minItems: itemCount,
      maxItems: itemCount,
      items: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            enum: candidateSlugs,
            description: "Identifier of the chosen item, copied exactly from the offered list.",
          },
          note: {
            type: "string",
            description:
              "One or two sentences on why this item is here and how it ties to this campaign. Do not restate the item's rules.",
          },
        },
        required: ["slug", "note"],
      },
    },
  },
  required: ["readAloud", "items"],
});
