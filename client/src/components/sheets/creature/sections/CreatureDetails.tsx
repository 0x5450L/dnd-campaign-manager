import { useCharacterSheet } from "../../../../hooks/useCharacterSheet";

type CreatureDetailTextField =
  | "senses"
  | "languages"
  | "damageVulnerabilities"
  | "damageResistances"
  | "damageImmunities"
  | "conditionImmunities";

const TEXT_FIELDS: { key: CreatureDetailTextField; label: string }[] = [
  { key: "senses", label: "Senses" },
  { key: "languages", label: "Languages" },
  { key: "damageVulnerabilities", label: "Damage Vulnerabilities" },
  { key: "damageResistances", label: "Damage Resistances" },
  { key: "damageImmunities", label: "Damage Immunities" },
  { key: "conditionImmunities", label: "Condition Immunities" },
];

const fieldClassName =
  "bg-transparent border-b border-rule/60 focus:border-gold outline-none text-xs text-ink py-0.5";

const labelClassName = "text-[10px] tracking-[0.12em] uppercase text-dim";

export const CreatureDetails = () => {
  const { state, setField } = useCharacterSheet();

  return (
    <div className="rounded-md border-[1.5px] border-rule bg-surface/70 shadow-md p-3 flex flex-col gap-2">
      <div className="font-fantasy font-bold text-sm tracking-[0.16em] uppercase text-gold-bright">
        Creature Details
      </div>

      <label className="flex flex-col gap-0.5">
        <span className={labelClassName}>Challenge Rating</span>
        <input
          type="number"
          min={0}
          step={0.125}
          value={state.challengeRating ?? ""}
          onChange={(e) =>
            setField(
              "challengeRating",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
          placeholder="—"
          className={fieldClassName}
        />
      </label>

      {TEXT_FIELDS.map((field) => (
        <label key={field.key} className="flex flex-col gap-0.5">
          <span className={labelClassName}>{field.label}</span>
          <input
            type="text"
            value={state[field.key]}
            onChange={(e) => setField(field.key, e.target.value)}
            placeholder="—"
            className={fieldClassName}
          />
        </label>
      ))}
    </div>
  );
};
