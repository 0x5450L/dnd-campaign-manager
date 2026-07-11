import { calcModifier, formatSigned, SPELL_SAVE_DC_BASE } from "../../../../../../../utils/dndMath";
import { SpellSlotsTracker } from "../../../../../../spells/SpellSlotsTracker";
import SpellAbilitySelect from "../fields/SpellAbilitySelect";
import StatInput from "../fields/StatInput";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";

export const SpellcastingSection = ({ draft, updateDraft, canEditOwn }: EditorBodyProps) => {
  const spellScore = draft.spellAbility
    ? draft.abilityScores?.find((s) => s.name === draft.spellAbility)?.score
    : undefined;
  const spellMod = typeof spellScore === "number" ? calcModifier(spellScore) : null;
  const spellDerived =
    spellMod !== null && draft.proficiencyBonus !== null
      ? {
          dc: SPELL_SAVE_DC_BASE + draft.proficiencyBonus + spellMod,
          attack: draft.proficiencyBonus + spellMod,
        }
      : null;

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-2.5">
        <SpellAbilitySelect
          value={draft.spellAbility}
          editable={canEditOwn}
          onChange={(spellAbility) => updateDraft({ spellAbility })}
        />
        <StatInput
          label="Prof"
          value={draft.proficiencyBonus ?? 0}
          editable={canEditOwn}
          onCommit={(proficiencyBonus) => updateDraft({ proficiencyBonus })}
          min={0}
        />
        {spellDerived && (
          <div className="flex h-16 sm:h-20 min-w-36 grow-[2] basis-0 flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-md border border-rule bg-bg/60 font-fantasy">
            <span className="text-sm sm:text-base leading-none text-dim">
              Save DC <span className="font-bold text-ink">{spellDerived.dc}</span>
            </span>
            <span className="text-sm sm:text-base leading-none text-dim">
              Spell atk{" "}
              <span className="font-bold text-ink">{formatSigned(spellDerived.attack)}</span>
            </span>
          </div>
        )}
      </div>

      <SpellSlotsTracker
        slots={draft.spellSlots ?? null}
        editable={canEditOwn}
        onChange={(spellSlots) => updateDraft({ spellSlots })}
      />
    </>
  );
};

export default SpellcastingSection;
