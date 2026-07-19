import AbilitiesSection from "../sections/AbilitiesSection";
import AbilityScoresSection from "../sections/AbilityScoresSection";
import AttacksBlock from "../fields/AttacksBlock";
import ConditionsSection from "../sections/ConditionsSection";
import MonsterStatsSection from "../sections/MonsterStatsSection";
import MonsterSpellcastingSection from "../sections/MonsterSpellcastingSection";
import ResourcePoolsSection from "../sections/ResourcePoolsSection";
import VitalsSection from "../sections/VitalsSection";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const MonsterEditorBody = (props: EditorBodyProps) => (
  <>
    <VitalsSection {...props} />
    <MonsterStatsSection {...props} />
    <AbilityScoresSection {...props} />
    <MonsterSpellcastingSection {...props} />
    <AttacksBlock
      attacks={props.participant.attacks}
      editable={props.canEditOwn}
      onChange={(attacks) => props.patchParticipant({ attacks })}
    />
    <AbilitiesSection {...props} />
    <ResourcePoolsSection {...props} />
    <ConditionsSection {...props} />
  </>
);

export default MonsterEditorBody;
