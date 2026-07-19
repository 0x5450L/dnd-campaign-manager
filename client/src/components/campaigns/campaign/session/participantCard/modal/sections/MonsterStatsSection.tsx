import type { EditorBodyProps } from "@/types/components/participantCard";
import {
  challengeRatingLabel,
  xpForChallengeRating,
} from "@/utils/dndMath";

const formatChallenge = (cr: number | null): string | null => {
  const label = challengeRatingLabel(cr);
  if (!label) return null;
  const xp = xpForChallengeRating(cr);
  return xp === null ? label : `${label} (${xp.toLocaleString()} XP)`;
};

export const MonsterStatsSection = ({ participant }: EditorBodyProps) => {
  const statline = [
    ["Speed", participant.speed],
    ["Senses", participant.senses],
    ["CR", formatChallenge(participant.challengeRating)],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const defenses = [
    ["Vulnerable", participant.damageVulnerabilities],
    ["Resistant", participant.damageResistances],
    ["Immune", participant.damageImmunities],
    ["Cond. immune", participant.conditionImmunities],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (statline.length === 0 && defenses.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {statline.length > 0 && (
        <div className="flex flex-wrap items-stretch gap-2.5">
          {statline.map(([label, value]) => (
            <div
              key={label}
              className="flex min-w-24 grow basis-0 flex-col items-center justify-center gap-1 rounded-md border border-rule bg-bg/60 px-3 py-2 font-fantasy"
            >
              <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
                {label}
              </span>
              <span className="text-center text-sm sm:text-base leading-snug text-ink">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
      {defenses.length > 0 && (
        <div className="flex flex-col gap-1 rounded-md border border-rule bg-bg/60 px-3 py-2">
          {defenses.map(([label, value]) => (
            <div key={label} className="text-sm leading-snug">
              <span className="mr-2 text-xs uppercase tracking-wider text-faint">{label}</span>
              <span className="text-dim">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonsterStatsSection;
