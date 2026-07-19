import AbilitiesSection from "../sections/AbilitiesSection";
import AbilityScoresSection from "../sections/AbilityScoresSection";
import AttacksBlock from "../fields/AttacksBlock";
import ConditionsSection from "../sections/ConditionsSection";
import MonsterStatsSection from "../sections/MonsterStatsSection";
import ResourcePoolsSection from "../sections/ResourcePoolsSection";
import SpellcastingSection from "../sections/SpellcastingSection";
import VitalsSection from "../sections/VitalsSection";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const NpcEditorBody = (props: EditorBodyProps) => (
  <>
    <VitalsSection {...props} />
    <MonsterStatsSection {...props} />
    <AbilityScoresSection {...props} />
    <SpellcastingSection {...props} />
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

export default NpcEditorBody;
