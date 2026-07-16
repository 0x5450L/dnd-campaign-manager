import { GradientInput } from "@/components/sheets/shared/inputs/GradientInput";
import { useCreatureSheet, useSheetActions } from "@/state/sheet";
import { xpForChallengeRating } from "@/utils/dndMath";
import { ChallengeRatingSelect } from "./ChallengeRatingSelect";

export const CreatureHeader = () => {
  const { name, race, challengeRating } = useCreatureSheet((s) => ({
    name: s.name,
    race: s.race,
    challengeRating: s.challengeRating,
  }));
  const { setSharedField, setCreatureField } = useSheetActions();

  const xpReward = xpForChallengeRating(challengeRating);

  return (
    <div className="cs-section-card p-3 flex items-stretch gap-4">
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div>
          <GradientInput
            value={name}
            onChange={(v) => setSharedField("name", v)}
            placeholder="Creature Name"
            large
            required
          />
          <div className="cs-label mt-1">Creature Name</div>
        </div>

        <div>
          <GradientInput
            value={race}
            onChange={(v) => setSharedField("race", v)}
            placeholder="—"
          />
          <div className="cs-label">Type</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pl-4 border-l border-rule">
        <span className="cs-section-title mb-1">CR</span>
        <ChallengeRatingSelect
          value={challengeRating}
          onChange={(v) => setCreatureField("challengeRating", v)}
        />
        <div className="flex flex-col items-center mt-1">
          <span className="w-16 text-center text-xs text-dim">
            {xpReward !== null ? xpReward.toLocaleString() : "—"}
          </span>
          <span className="cs-label">XP</span>
        </div>
      </div>
    </div>
  );
};
