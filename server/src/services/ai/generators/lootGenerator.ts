import { LOOT_CANDIDATE_COUNT } from "@dnd/shared/constants/ai";
import type { GenerateLootPayload, GeneratedLoot, GeneratedLootItem } from "@dnd/shared/dto/ai";
import type { SrdItemSummary } from "@dnd/shared/dto/srd";
import type { ReferenceService } from "../../reference/referenceService";
import type { CampaignLootContext } from "../aiContextRepository";
import { buildLootUserPrompt, LOOT_SYSTEM_PROMPT } from "../prompts/lootPrompt";
import type { TextProvider } from "../providers/aiProvider";
import { AiInvalidOutputError } from "../providers/providerErrors";
import {
  buildLootOutputSchema,
  buildLootResponseSchema,
  type LootModelOutput,
} from "../schemas/lootSchema";
import { selectLootCandidates } from "./lootCandidates";

const MAX_VALIDATION_ATTEMPTS = 2;

const namesForSlugs = (
  pool: { slug: string; name: string }[],
  slugs: string[],
): string[] => {
  if (slugs.length === 0) {
    return [];
  }
  const wanted = new Set(slugs);
  return pool.filter((entry) => wanted.has(entry.slug)).map((entry) => entry.name);
};

export class NotEnoughCandidatesError extends Error {
  constructor(
    readonly available: number,
    readonly requested: number,
  ) {
    super(`item catalogue offered ${available} candidate(s) for ${requested} requested item(s)`);
    this.name = "NotEnoughCandidatesError";
  }
}

export type LootGenerationOutcome = {
  output: GeneratedLoot;
  model: string;
};

export class LootGenerator {
  constructor(
    private readonly provider: TextProvider,
    private readonly reference: ReferenceService,
  ) {}

  async generate(
    context: CampaignLootContext,
    payload: GenerateLootPayload,
  ): Promise<LootGenerationOutcome> {
    const pool = await this.reference.listItemPool();
    const excluded = new Set(payload.excludeSlugs ?? []);
    const remaining = pool.filter((item) => !excluded.has(item.slug));
    const candidates = selectLootCandidates(
      remaining.length >= payload.itemCount ? remaining : pool,
      payload.richness,
      LOOT_CANDIDATE_COUNT,
    );

    if (candidates.length < payload.itemCount) {
      throw new NotEnoughCandidatesError(candidates.length, payload.itemCount);
    }

    const slugs = candidates.map((item) => item.slug);
    const outputSchema = buildLootOutputSchema(slugs);
    const request = {
      systemPrompt: LOOT_SYSTEM_PROMPT,
      userPrompt: buildLootUserPrompt(
        context,
        payload,
        candidates,
        namesForSlugs(pool, payload.excludeSlugs ?? []),
      ),
      responseSchema: buildLootResponseSchema(payload.itemCount, slugs),
    };

    let issues: string[] = [];

    for (let attempt = 0; attempt < MAX_VALIDATION_ATTEMPTS; attempt += 1) {
      const result = await this.provider.generateStructured(request);
      const parsed = outputSchema.safeParse(result.data);

      if (parsed.success) {
        return {
          output: this.enrich(parsed.data, candidates),
          model: result.model,
        };
      }

      issues = parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
      );
    }

    throw new AiInvalidOutputError(this.provider.id, issues);
  }

  private enrich(
    output: LootModelOutput,
    candidates: SrdItemSummary[],
  ): GeneratedLoot {
    const bySlug = new Map(candidates.map((item) => [item.slug, item]));
    const items: GeneratedLootItem[] = [];

    for (const picked of output.items) {
      const item = bySlug.get(picked.slug);
      if (!item) {
        continue;
      }
      items.push({
        slug: item.slug,
        name: item.name,
        rarity: item.rarity,
        itemType: item.itemType,
        source: item.source,
        note: picked.note,
      });
    }

    return { readAloud: output.readAloud, items };
  }
}
