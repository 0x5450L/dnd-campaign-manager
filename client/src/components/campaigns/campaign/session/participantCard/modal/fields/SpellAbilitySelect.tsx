import { useState } from "react";
import type { ParticipantAbilityScore } from "../../../../../../../types/encounter";
import { SPELLCASTING_ABILITY_NAMES } from "../../../../../../../constants/dnd";
import StatTile from "./StatTile";

type AbilityName = ParticipantAbilityScore["name"];

type SpellAbilitySelectProps = {
  value: AbilityName | null;
  editable: boolean;
  onChange: (value: AbilityName | null) => void;
};

export const SpellAbilitySelect = ({
  value,
  editable,
  onChange,
}: SpellAbilitySelectProps) => {
  const [open, setOpen] = useState(false);

  const options: (AbilityName | null)[] = [null, ...SPELLCASTING_ABILITY_NAMES];

  const pick = (option: AbilityName | null) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="relative flex min-w-20 grow basis-0">
      <StatTile label="Spell" focusable={editable}>
        <button
          type="button"
          disabled={!editable}
          onClick={() => setOpen((o) => !o)}
          aria-label="Spell ability"
          className="w-full text-center font-fantasy text-xl sm:text-2xl font-bold uppercase leading-none text-ink"
        >
          {value ? value.toUpperCase() : "—"}
        </button>
      </StatTile>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 top-full z-20 mt-1 flex w-full min-w-24 flex-col gap-0.5 rounded-md border border-rule bg-surface/95 p-1.5 shadow-xl backdrop-blur">
            {options.map((option) => {
              const isActive = option === value;
              return (
                <li key={option ?? "none"}>
                  <button
                    type="button"
                    onClick={() => pick(option)}
                    className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 font-fantasy text-sm uppercase tracking-wider transition-colors ${
                      isActive
                        ? "bg-gold/15 text-gold-bright"
                        : "text-dim hover:bg-surface-light hover:text-ink"
                    }`}
                  >
                    <span>{option ? option.toUpperCase() : "—"}</span>
                    {isActive && <span className="text-xs">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default SpellAbilitySelect;
