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

export const VitalsSection = ({ participant, patchParticipant, canEditOwn, canManage }: EditorBodyProps) => {
  const { participants } = useActiveEncounter();
  const { rollInitiative } = useParticipantActions();
  const canRollInitiative = canEditOwn && participants.some((p) => p.id === participant.id);

  return (
  <>
    <div className="flex flex-wrap items-stretch gap-2.5">
      <div className="relative flex min-w-16 grow basis-0 sm:min-w-20">
        <InitiativeBlock
          value={participant.sortOrder}
          isActive={false}
          size="lg"
          onChange={canEditOwn ? (sortOrder) => patchParticipant({ sortOrder }) : undefined}
        />
        {canRollInitiative && (
          <button
            type="button"
            onClick={() => rollInitiative([participant.id])}
            aria-label="Roll initiative"
            className="absolute -right-1 -top-1 rounded border border-rule bg-bg px-1 text-[11px] uppercase tracking-wider text-faint transition-colors hover:border-hover hover:text-ink"
          >
            d20
          </button>
        )}
      </div>
      <ArmorClassBlock
        value={participant.armorClass}
        hidden={participant.acHidden}
        isDM={canManage}
        usesShield={participant.usesShield}
        size="lg"
        onChange={canEditOwn ? (armorClass) => patchParticipant({ armorClass }) : undefined}
        onToggleHidden={canManage ? () => patchParticipant({ acHidden: !participant.acHidden }) : undefined}
        onToggleShield={
          canEditOwn ? () => patchParticipant({ usesShield: !participant.usesShield }) : undefined
        }
      />
      <StatInput
        label="Cur HP"
        value={participant.currentHp}
        editable={canEditOwn}
        onCommit={(currentHp) => patchParticipant({ currentHp })}
        min={0}
        max={participant.maxHp}
      />
      <StatInput
        label="Max HP"
        value={participant.maxHp}
        editable={canEditOwn}
        onCommit={(maxHp) => patchParticipant({ maxHp, currentHp: Math.min(participant.currentHp, maxHp) })}
        min={1}
      />
      <StatInput
        label="Tmp HP"
        value={participant.tempHp}
        editable={canEditOwn}
        onCommit={(tempHp) => patchParticipant({ tempHp })}
        min={0}
      />
    </div>

    <HpBar currentHp={participant.currentHp} maxHp={participant.maxHp} tempHp={participant.tempHp} hidden={false} />

    {canEditOwn && (
      <HpControls
        size="lg"
        onDamage={(amount) => patchParticipant(applyDamage(participant, amount))}
        onHeal={(amount) => patchParticipant(applyHealing(participant, amount))}
        onTemp={(amount) => patchParticipant(applyTempHp(participant, amount))}
      />
    )}
  </>
  );
};

export default VitalsSection;
