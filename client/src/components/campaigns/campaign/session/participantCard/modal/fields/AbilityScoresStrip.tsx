import type { ParticipantAbilityScore } from "@/types/encounter";
import { ABILITY_NAMES } from "@/constants/dnd";
import { formatAbilityModifier } from "@/utils/dndMath";
import EditableNumber from "@/components/campaigns/campaign/session/participantCard/blocks/EditableNumber";

type AbilityScoresStripProps = {
  scores: ParticipantAbilityScore[] | null;
  editable?: boolean;
  onScoreChange?: (name: ParticipantAbilityScore["name"], score: number) => void;
};

export const AbilityScoresStrip = ({
  scores,
  editable = false,
  onScoreChange,
}: AbilityScoresStripProps) => {
  const byName = new Map(scores?.map((s) => [s.name, s.score]) ?? []);

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2.5 rounded border border-rule bg-bg/40 px-2 py-2.5">
      {ABILITY_NAMES.map((name) => {
        const score = byName.get(name);
        const hasScore = typeof score === "number";
        return (
          <div key={name} className="flex min-w-16 flex-1 flex-col items-center gap-1">
            <span className="font-fantasy text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-gold-bright">
              {name}
            </span>
            <span className="font-fantasy text-lg sm:text-xl font-semibold leading-none text-ink">
              {hasScore ? formatAbilityModifier(score) : "—"}
            </span>
            {onScoreChange ? (
              <EditableNumber
                value={hasScore ? score : 10}
                editable={editable}
                onCommit={(next) => onScoreChange(name, next)}
                min={1}
                max={30}
                ariaLabel={`${name} score`}
                className="w-9 rounded border border-rule/60 text-xs sm:text-sm leading-tight text-faint transition-colors focus:border-hover focus:text-ink"
              />
            ) : (
              <span className="text-xs sm:text-sm leading-none text-faint">
                {hasScore ? score : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScoresStrip;
