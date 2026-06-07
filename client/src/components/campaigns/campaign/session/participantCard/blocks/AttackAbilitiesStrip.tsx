import type { ParticipantAbilityScore } from "../../../../../../types/session";
import {
  formatAbilityModifier,
  formatSigned,
} from "../../../../../../utils/dndMath";

type AbilityName = ParticipantAbilityScore["name"];

type AttackAbilitiesStripProps = {
  scores: ParticipantAbilityScore[] | null;
  spellAbility: AbilityName | null;
  proficiencyBonus: number | null;
};

type Cell = { key: string; label: string; value: string };

const modifierOrDash = (score: number | undefined) =>
  typeof score === "number" ? formatAbilityModifier(score) : "—";

export const AttackAbilitiesStrip = ({
  scores,
  spellAbility,
  proficiencyBonus,
}: AttackAbilitiesStripProps) => {
  const byName = new Map<AbilityName, number>(
    scores?.map((s) => [s.name, s.score]) ?? [],
  );

  const cells: Cell[] = [
    { key: "str", label: "STR", value: modifierOrDash(byName.get("str")) },
    { key: "dex", label: "DEX", value: modifierOrDash(byName.get("dex")) },
    {
      key: "spl",
      label: "SPL",
      value: modifierOrDash(spellAbility ? byName.get(spellAbility) : undefined),
    },
    {
      key: "prf",
      label: "PROF",
      value: proficiencyBonus === null ? "—" : formatSigned(proficiencyBonus),
    },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-rule/60 rounded border border-rule bg-bg/40">
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="flex items-center justify-center gap-1.5 p-2.5"
        >
          <span className="font-fantasy text-xs font-semibold uppercase tracking-[0.16em] text-gold-bright">
            {cell.label}
          </span>
          <span className="font-fantasy text-xs font-semibold text-ink leading-none">
            {cell.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AttackAbilitiesStrip;
