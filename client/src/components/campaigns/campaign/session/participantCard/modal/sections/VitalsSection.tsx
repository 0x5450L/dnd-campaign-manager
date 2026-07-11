import {
  applyDamage,
  applyHealing,
  applyTempHp,
} from "../../../../../../../utils/encounterParticipant";
import ArmorClassBlock from "../../blocks/ArmorClassBlock";
import HpBar from "../../blocks/HpBar";
import HpControls from "../../blocks/HpControls";
import InitiativeBlock from "../../blocks/InitiativeBlock";
import StatInput from "../fields/StatInput";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";

export const VitalsSection = ({ draft, updateDraft, canEditOwn, canManage }: EditorBodyProps) => (
  <>
    <div className="flex flex-wrap items-stretch gap-2.5">
      <InitiativeBlock
        value={draft.sortOrder}
        isActive={false}
        size="lg"
        onChange={canEditOwn ? (sortOrder) => updateDraft({ sortOrder }) : undefined}
      />
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

export default VitalsSection;
