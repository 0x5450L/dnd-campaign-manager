import { calcModifier, formatSigned, SPELL_SAVE_DC_BASE } from "@/utils/dndMath";
import { SpellSlotsTracker } from "@/components/spells/SpellSlotsTracker";
import SpellAbilitySelect from "../fields/SpellAbilitySelect";
import StatInput from "../fields/StatInput";
import type { EditorBodyProps } from "@/types/components/participantCard";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";

export const SpellcastingSection = ({ participant, patchParticipant, canEditOwn }: EditorBodyProps) => {
  const { applySpellSlotUsage } = useParticipantActions();
  const spellScore = participant.spellAbility
    ? participant.abilityScores?.find((s) => s.name === participant.spellAbility)?.score
    : undefined;
  const spellMod = typeof spellScore === "number" ? calcModifier(spellScore) : null;
  const spellDerived =
    spellMod !== null && participant.proficiencyBonus !== null
      ? {
          dc: SPELL_SAVE_DC_BASE + participant.proficiencyBonus + spellMod,
          attack: participant.proficiencyBonus + spellMod,
        }
      : null;

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-2.5">
        <SpellAbilitySelect
          value={participant.spellAbility}
          editable={canEditOwn}
          onChange={(spellAbility) => patchParticipant({ spellAbility })}
        />
        <StatInput
          label="Prof"
          value={participant.proficiencyBonus ?? 0}
          editable={canEditOwn}
          onCommit={(proficiencyBonus) => patchParticipant({ proficiencyBonus })}
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
        slots={participant.spellSlots ?? null}
        editable={canEditOwn}
        onCapacityCommit={(spellSlots) => patchParticipant({ spellSlots })}
        onToggleUsed={(level, action, count) =>
          applySpellSlotUsage(participant.id, level, action, count)
        }
      />
    </>
  );
};

export default SpellcastingSection;
