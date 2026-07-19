import { calcModifier, formatSigned, SPELL_SAVE_DC_BASE } from "@/utils/dndMath";
import { SpellSlotsTracker } from "@/components/spells/SpellSlotsTracker";
import type { EditorBodyProps } from "@/types/components/participantCard";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";

export const MonsterSpellcastingSection = ({ participant, canEditOwn }: EditorBodyProps) => {
  const { applySpellSlotUsage } = useParticipantActions();
  const spellSlots = participant.spellSlots ?? [];
  const hasSlots = spellSlots.some((slot) => slot.total > 0);

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

  if (!hasSlots && !spellDerived) return null;

  return (
    <>
      {spellDerived && (
        <div className="flex h-14 items-center justify-center gap-4 rounded-md border border-rule bg-bg/60 font-fantasy">
          <span className="text-sm sm:text-base leading-none text-dim">
            Save DC <span className="font-bold text-ink">{spellDerived.dc}</span>
          </span>
          <span className="text-sm sm:text-base leading-none text-dim">
            Spell atk{" "}
            <span className="font-bold text-ink">{formatSigned(spellDerived.attack)}</span>
          </span>
        </div>
      )}
      {hasSlots && (
        <SpellSlotsTracker
          slots={spellSlots}
          editable={canEditOwn}
          onToggleUsed={(level, action) => applySpellSlotUsage(participant.id, level, action)}
        />
      )}
    </>
  );
};

export default MonsterSpellcastingSection;
