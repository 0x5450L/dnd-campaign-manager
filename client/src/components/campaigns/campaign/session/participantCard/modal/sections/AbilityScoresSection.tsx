import type { ParticipantAbilityScore } from "../../../../../../../types/encounter";
import AbilityScoresStrip from "../fields/AbilityScoresStrip";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";

type AbilityName = ParticipantAbilityScore["name"];

const setScore = (
  scores: ParticipantAbilityScore[] | null,
  name: AbilityName,
  score: number,
): ParticipantAbilityScore[] => {
  const base = scores ?? [];
  const exists = base.some((s) => s.name === name);
  return exists
    ? base.map((s) => (s.name === name ? { ...s, score } : s))
    : [...base, { name, score }];
};

export const AbilityScoresSection = ({ draft, updateDraft, canEditOwn }: EditorBodyProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
      Ability scores
    </span>
    <AbilityScoresStrip
      scores={draft.abilityScores}
      editable={canEditOwn}
      onScoreChange={(name, score) =>
        updateDraft({ abilityScores: setScore(draft.abilityScores, name, score) })
      }
    />
  </div>
);

export default AbilityScoresSection;
