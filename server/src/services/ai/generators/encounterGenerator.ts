import { ENCOUNTER_CANDIDATE_COUNT } from "@dnd/shared/constants/encounter";
import type {
  GenerateEncounterPayload,
  GeneratedEncounter,
  GeneratedEncounterEntry,
} from "@dnd/shared/dto/ai";
import type { CreateParticipantPayload } from "@dnd/shared/dto/session";
import type { SrdCreature, SrdCreatureSummary } from "@dnd/shared/dto/srd";
import type { EncounterBudget } from "@dnd/shared/types/encounter";
import { xpForChallengeRating } from "@dnd/shared/utils/dndMath";
import { buildEncounterBudget, buildXpReport } from "@dnd/shared/utils/encounterBudget";
import { srdCreatureToParticipant } from "@dnd/shared/utils/srd/creatureParticipantMapper";
import type { ReferenceService } from "../../reference/referenceService";
import type { CampaignLootContext } from "../aiContextRepository";
import {
  buildEncounterUserPrompt,
  ENCOUNTER_SYSTEM_PROMPT,
} from "../prompts/encounterPrompt";
import type { TextProvider } from "../providers/aiProvider";
import { AiInvalidOutputError } from "../providers/providerErrors";
import {
  buildEncounterOutputSchema,
  buildEncounterResponseSchema,
  type EncounterModelOutput,
} from "../schemas/encounterSchema";
import { selectEncounterCandidates } from "./encounterCandidates";

const MAX_VALIDATION_ATTEMPTS = 2;

export class NoCreatureCandidatesError extends Error {
  readonly humanMessage: string;

  constructor(
    readonly poolSize: number,
    budget: EncounterBudget,
  ) {
    super(
      `creature catalogue offered no candidates from a pool of ${poolSize} for a raw budget of ${budget.rawBudgetXp} XP`,
    );
    this.name = "NoCreatureCandidatesError";
    this.humanMessage =
      poolSize === 0
        ? "The creature catalogue is empty right now — the SRD source could not be reached. Try again shortly."
        : `No SRD creature fits a ${budget.difficulty} fight for ${budget.partySize} character(s) of level ${budget.partyLevel} at this group size (${budget.rawBudgetXp} XP to spend across ${budget.minCreatures}–${budget.maxCreatures} creatures). Try a different difficulty or group size.`;
  }
}

export type EncounterGenerationOutcome = {
  output: GeneratedEncounter;
  model: string;
};

export class EncounterGenerator {
  constructor(
    private readonly provider: TextProvider,
    private readonly reference: ReferenceService,
  ) {}

  async generate(
    context: CampaignLootContext,
    payload: GenerateEncounterPayload,
  ): Promise<EncounterGenerationOutcome> {
    const budget = buildEncounterBudget(
      payload.difficulty,
      payload.sizeBand,
      payload.partyLevel,
      payload.partySize,
    );

    const pool = await this.reference.listCreaturePool();
    const excluded = new Set(payload.excludeSlugs ?? []);
    const remaining = pool.filter((creature) => !excluded.has(creature.slug));
    const candidates = selectEncounterCandidates(
      remaining.length > 0 ? remaining : pool,
      budget,
      ENCOUNTER_CANDIDATE_COUNT,
    );

    if (candidates.length === 0) {
      throw new NoCreatureCandidatesError(pool.length, budget);
    }

    const slugs = candidates.map((creature) => creature.slug);
    const outputSchema = buildEncounterOutputSchema(slugs, budget);
    const request = {
      systemPrompt: ENCOUNTER_SYSTEM_PROMPT,
      userPrompt: buildEncounterUserPrompt(
        context,
        payload,
        budget,
        candidates,
        pool
          .filter((creature) => excluded.has(creature.slug))
          .map((creature) => creature.name),
      ),
      responseSchema: buildEncounterResponseSchema(slugs, budget),
    };

    let issues: string[] = [];

    for (let attempt = 0; attempt < MAX_VALIDATION_ATTEMPTS; attempt += 1) {
      const result = await this.provider.generateStructured(request);
      const parsed = outputSchema.safeParse(result.data);

      if (parsed.success) {
        return {
          output: await this.enrich(parsed.data, candidates, budget),
          model: result.model,
        };
      }

      issues = parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
      );
    }

    throw new AiInvalidOutputError(this.provider.id, issues);
  }

  private async enrich(
    output: EncounterModelOutput,
    candidates: SrdCreatureSummary[],
    budget: ReturnType<typeof buildEncounterBudget>,
  ): Promise<GeneratedEncounter> {
    const bySlug = new Map(
      candidates.map((creature) => [creature.slug, creature]),
    );
    const entries: GeneratedEncounterEntry[] = [];
    const participants: CreateParticipantPayload[] = [];
    let rawXp = 0;
    let creatureCount = 0;

    for (const picked of output.entries) {
      const summary = bySlug.get(picked.slug);
      if (!summary) {
        continue;
      }
      const xpEach = xpForChallengeRating(summary.challengeRating) ?? 0;
      rawXp += xpEach * picked.count;
      creatureCount += picked.count;

      entries.push({
        slug: summary.slug,
        name: summary.name,
        challengeRating: summary.challengeRating,
        source: summary.source,
        count: picked.count,
        xpEach,
        note: picked.note,
      });

      const detail = await this.reference.getCreature(summary.slug);
      if (detail) {
        participants.push(...this.toParticipants(detail, picked.count));
      }
    }

    return {
      readAloud: output.readAloud,
      tacticalNote: output.tacticalNote,
      entries,
      budget,
      xp: buildXpReport(rawXp, creatureCount, budget),
      participants,
    };
  }

  private toParticipants(
    creature: SrdCreature,
    count: number,
  ): CreateParticipantPayload[] {
    const seed = srdCreatureToParticipant(creature);
    return Array.from({ length: count }, (_, index) => ({
      ...seed,
      name: count > 1 ? `${seed.name} ${index + 1}` : seed.name,
      sortOrder: 0,
    }));
  }
}
