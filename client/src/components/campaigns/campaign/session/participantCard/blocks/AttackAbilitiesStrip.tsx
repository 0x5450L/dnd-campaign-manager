import type { ParticipantAbilityScore } from "../../../../../../types/session";

type AbilityName = ParticipantAbilityScore["name"];

type AttackAbilitiesStripProps = {
  scores: ParticipantAbilityScore[] | null;
  spellAbility: AbilityName | null;
  proficiencyBonus: number | null;
};

const formatModifier = (score: number) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

const formatBonus = (value: number | null) => {
  if (value === null) return "—";
  return value >= 0 ? `+${value}` : `${value}`;
};

type Cell = { key: string; label: string; value: string };

export const AttackAbilitiesStrip = ({
  scores,
  spellAbility,
  proficiencyBonus,
}: AttackAbilitiesStripProps) => {
  const byName = new Map<AbilityName, number>(
    scores?.map((s) => [s.name, s.score]) ?? [],
  );
  const str = byName.get("str");
  const dex = byName.get("dex");
  const spell = spellAbility ? byName.get(spellAbility) : undefined;

  const cells: Cell[] = [
    { key: "str", label: "STR", value: typeof str === "number" ? formatModifier(str) : "—" },
    { key: "dex", label: "DEX", value: typeof dex === "number" ? formatModifier(dex) : "—" },
    {
      key: "spl",
      label: "SPL",
      value: typeof spell === "number" ? formatModifier(spell) : "—",
    },
    { key: "prf", label: "PROF", value: formatBonus(proficiencyBonus) },
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
