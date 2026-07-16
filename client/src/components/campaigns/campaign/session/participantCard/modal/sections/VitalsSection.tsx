import {
  applyDamage,
  applyHealing,
  applyTempHp,
} from "@/utils/encounterParticipant";
import ArmorClassBlock from "@/components/campaigns/campaign/session/participantCard/blocks/ArmorClassBlock";
import HpBar from "@/components/campaigns/campaign/session/participantCard/blocks/HpBar";
import HpControls from "@/components/campaigns/campaign/session/participantCard/blocks/HpControls";
import InitiativeBlock from "@/components/campaigns/campaign/session/participantCard/blocks/InitiativeBlock";
import StatInput from "../fields/StatInput";
import type { EditorBodyProps } from "@/types/components/participantCard";
import { useActiveEncounter } from "@/hooks/liveSession/useActiveEncounter";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";

export const VitalsSection = ({ draft, updateDraft, canEditOwn, canManage }: EditorBodyProps) => {
  const { participants } = useActiveEncounter();
  const { rollInitiative } = useParticipantActions();
  const canRollInitiative = canEditOwn && participants.some((p) => p.id === draft.id);

  return (
  <>
    <div className="flex flex-wrap items-stretch gap-2.5">
      <div className="relative flex min-w-16 grow basis-0 sm:min-w-20">
        <InitiativeBlock
          value={draft.sortOrder}
          isActive={false}
          size="lg"
          onChange={canEditOwn ? (sortOrder) => updateDraft({ sortOrder }) : undefined}
        />
        {canRollInitiative && (
          <button
            type="button"
            onClick={() => rollInitiative([draft.id])}
            aria-label="Roll initiative"
            className="absolute -right-1 -top-1 rounded border border-rule bg-bg px-1 text-[11px] uppercase tracking-wider text-faint transition-colors hover:border-hover hover:text-ink"
          >
            d20
          </button>
        )}
      </div>
      <ArmorClassBlock
        value={draft.armorClass}
        hidden={draft.acHidden}
        isDM={canManage}
        usesShield={draft.usesShield}
        size="lg"
        onChange={canEditOwn ? (armorClass) => updateDraft({ armorClass }) : undefined}
        onToggleHidden={canManage ? () => updateDraft({ acHidden: !draft.acHidden }) : undefined}
        onToggleShield={
          canEditOwn ? () => updateDraft({ usesShield: !draft.usesShield }) : undefined
        }
      />
      <StatInput
        label="Cur HP"
        value={draft.currentHp}
        editable={canEditOwn}
        onCommit={(currentHp) => updateDraft({ currentHp })}
        min={0}
        max={draft.maxHp}
      />
      <StatInput
        label="Max HP"
        value={draft.maxHp}
        editable={canEditOwn}
        onCommit={(maxHp) => updateDraft({ maxHp, currentHp: Math.min(draft.currentHp, maxHp) })}
        min={1}
      />
      <StatInput
        label="Tmp HP"
        value={draft.tempHp}
        editable={canEditOwn}
        onCommit={(tempHp) => updateDraft({ tempHp })}
        min={0}
      />
    </div>

    <HpBar currentHp={draft.currentHp} maxHp={draft.maxHp} tempHp={draft.tempHp} hidden={false} />

    {canEditOwn && (
      <HpControls
        size="lg"
        onDamage={(amount) => updateDraft(applyDamage(draft, amount))}
        onHeal={(amount) => updateDraft(applyHealing(draft, amount))}
        onTemp={(amount) => updateDraft(applyTempHp(draft, amount))}
      />
    )}
  </>
  );
};

export default VitalsSection;
