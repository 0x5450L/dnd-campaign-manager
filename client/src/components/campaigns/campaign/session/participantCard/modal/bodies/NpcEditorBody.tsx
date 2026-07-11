import AbilityScoresSection from "../sections/AbilityScoresSection";
import AttacksBlock from "../fields/AttacksBlock";
import ConditionsSection from "../sections/ConditionsSection";
import SpellcastingSection from "../sections/SpellcastingSection";
import VitalsSection from "../sections/VitalsSection";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";

export const NpcEditorBody = (props: EditorBodyProps) => (
  <>
    <VitalsSection {...props} />
    <AbilityScoresSection {...props} />
    <SpellcastingSection {...props} />
    <AttacksBlock
      attacks={props.draft.attacks}
      editable={props.canEditOwn}
      onChange={(attacks) => props.updateDraft({ attacks })}
    />
    <ConditionsSection {...props} />
  </>
);

export default NpcEditorBody;
