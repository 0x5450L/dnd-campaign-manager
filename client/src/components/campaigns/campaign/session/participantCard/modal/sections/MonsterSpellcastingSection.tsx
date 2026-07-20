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
        <div className="flex flex-wrap items-stretch gap-2.5">
          <div className="flex min-w-24 grow basis-0 flex-col items-center justify-center gap-1 rounded-md border border-rule bg-bg/60 px-3 py-2 font-fantasy">
            <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
              Save DC
            </span>
            <span className="text-sm sm:text-base font-bold leading-snug text-ink">
              {spellDerived.dc}
            </span>
          </div>
          <div className="flex min-w-24 grow basis-0 flex-col items-center justify-center gap-1 rounded-md border border-rule bg-bg/60 px-3 py-2 font-fantasy">
            <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
              Spell atk
            </span>
            <span className="text-sm sm:text-base font-bold leading-snug text-ink">
              {formatSigned(spellDerived.attack)}
            </span>
          </div>
        </div>
      )}
      {hasSlots && (
        <SpellSlotsTracker
          slots={spellSlots}
          editable={canEditOwn}
          onToggleUsed={(level, action, count) =>
            applySpellSlotUsage(participant.id, level, action, count)
          }
        />
      )}
    </>
  );
};

export default MonsterSpellcastingSection;
