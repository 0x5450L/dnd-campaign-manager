import type { SrdCreatureSummary } from "@dnd/shared/dto/srd";
import type { EncounterBudget } from "@dnd/shared/types/encounter";
import { xpForChallengeRating } from "@dnd/shared/utils/dndMath";

const LOWER_BOUND_DIVISOR = 3;

const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const byDistanceToTarget = (
  pool: SrdCreatureSummary[],
  targetXp: number,
): SrdCreatureSummary[] =>
  pool
    .map((creature) => ({
      creature,
      xp: xpForChallengeRating(creature.challengeRating),
    }))
    .filter(
      (entry): entry is { creature: SrdCreatureSummary; xp: number } =>
        entry.xp !== null,
    )
    .sort((a, b) => Math.abs(a.xp - targetXp) - Math.abs(b.xp - targetXp))
    .map((entry) => entry.creature);

export const selectEncounterCandidates = (
  pool: SrdCreatureSummary[],
  budget: EncounterBudget,
  limit: number,
): SrdCreatureSummary[] => {
  const maxXp = budget.rawBudgetXp / budget.minCreatures;
  const minXp = budget.rawBudgetXp / (budget.maxCreatures * LOWER_BOUND_DIVISOR);

  const matching = pool.filter((creature) => {
    const xp = xpForChallengeRating(creature.challengeRating);
    return xp !== null && xp >= minXp && xp <= maxXp;
  });

  if (matching.length > 0) {
    return shuffle(matching).slice(0, limit);
  }

  const targetXp =
    budget.rawBudgetXp / ((budget.minCreatures + budget.maxCreatures) / 2);
  return byDistanceToTarget(pool, targetXp).slice(0, limit);
};
