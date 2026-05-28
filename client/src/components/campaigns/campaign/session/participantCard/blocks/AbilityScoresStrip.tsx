import type { ParticipantAbilityScore } from "../../../../../../types/session";

type AbilityScoresStripProps = {
  scores: ParticipantAbilityScore[] | null;
};

const ABILITY_ORDER: ParticipantAbilityScore["name"][] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];

const formatModifier = (score: number) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const AbilityScoresStrip = ({ scores }: AbilityScoresStripProps) => {
  const byName = new Map(scores?.map((s) => [s.name, s.score]) ?? []);

  return (
    <div className="flex items-center gap-1.5 rounded border border-rule bg-bg/40 px-2 py-1">
      {ABILITY_ORDER.map((name) => {
        const score = byName.get(name);
        const hasScore = typeof score === "number";
        return (
          <div
            key={name}
            className="flex min-w-10 flex-1 flex-col items-center"
          >
            <span className="text-[8px] uppercase tracking-[0.18em] text-faint">
              {name}
            </span>
            <span className="font-fantasy text-[11px] font-semibold text-ink leading-tight">
              {hasScore ? formatModifier(score) : "—"}
            </span>
            <span className="text-[8px] text-faint leading-none">
              {hasScore ? score : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScoresStrip;
