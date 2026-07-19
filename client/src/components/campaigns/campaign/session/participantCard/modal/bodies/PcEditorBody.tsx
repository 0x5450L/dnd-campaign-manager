import AbilityScoresSection from "../sections/AbilityScoresSection";
import AttacksBlock from "../fields/AttacksBlock";
import ConditionsSection from "../sections/ConditionsSection";
import DeathSavesSection from "../sections/DeathSavesSection";
import SpellcastingSection from "../sections/SpellcastingSection";
import VitalsSection from "../sections/VitalsSection";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const PcEditorBody = (props: EditorBodyProps) => (
  <>
    <VitalsSection {...props} />
    <AbilityScoresSection {...props} />
    <SpellcastingSection {...props} />
    <AttacksBlock
      attacks={props.participant.attacks}
      editable={props.canEditOwn}
      onChange={(attacks) => props.patchParticipant({ attacks })}
    />
    <DeathSavesSection {...props} />
    <ConditionsSection {...props} />
  </>
);

export default PcEditorBody;
