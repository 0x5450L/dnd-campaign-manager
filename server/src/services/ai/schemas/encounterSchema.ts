import { z } from "zod";
import type { EncounterBudget } from "@dnd/shared/types/encounter";
import type { JsonSchemaNode } from "../providers/aiProvider";

const MAX_DISTINCT_ENTRIES = 5;

export const buildEncounterOutputSchema = (
  candidateSlugs: string[],
  budget: EncounterBudget,
) => {
  const slugs = new Set(candidateSlugs);
  return z.object({
    readAloud: z.string().trim().min(20).max(1200),
    tacticalNote: z.string().trim().min(20).max(600),
    entries: z
      .array(
        z.object({
          slug: z
            .string()
            .trim()
            .refine((slug) => slugs.has(slug), {
              message: "slug is not one of the offered candidates",
            }),
          count: z.number().int().min(1).max(budget.maxCreatures),
          note: z.string().trim().min(10).max(400),
        }),
      )
      .min(1)
      .max(MAX_DISTINCT_ENTRIES)
      .refine(
        (entries) =>
          new Set(entries.map((entry) => entry.slug)).size === entries.length,
        { message: "the same creature was picked more than once" },
      )
      .refine(
        (entries) =>
          entries.reduce((sum, entry) => sum + entry.count, 0) <=
          budget.maxCreatures,
        {
          message: `the total number of creatures must not exceed ${budget.maxCreatures}`,
        },
      ),
  });
};

export type EncounterModelOutput = z.infer<
  ReturnType<typeof buildEncounterOutputSchema>
>;

export const buildEncounterResponseSchema = (
  candidateSlugs: string[],
  budget: EncounterBudget,
): JsonSchemaNode => ({
  type: "object",
  properties: {
    readAloud: {
      type: "string",
      description:
        "One or two paragraphs the DM reads aloud as the creatures appear. Describe what the party sees and hears, not statistics. No markdown, no bullet points.",
    },
    tacticalNote: {
      type: "string",
      description:
        "Two or three sentences for the DM only: how these creatures fight together, what they do on the first round, and what makes this fight dangerous or survivable. Never mention experience points or difficulty labels.",
    },
    entries: {
      type: "array",
      minItems: 1,
      maxItems: MAX_DISTINCT_ENTRIES,
      items: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            enum: candidateSlugs,
            description:
              "Identifier of the chosen creature, copied exactly from the offered list.",
          },
          count: {
            type: "integer",
            minimum: 1,
            maximum: budget.maxCreatures,
            description: `How many of this creature are present. The counts of all entries added together must be between ${budget.minCreatures} and ${budget.maxCreatures}.`,
          },
          note: {
            type: "string",
            description:
              "One or two sentences on why this creature is here and how it fits the campaign. Do not restate its rules.",
          },
        },
        required: ["slug", "count", "note"],
      },
    },
  },
  required: ["readAloud", "tacticalNote", "entries"],
});
