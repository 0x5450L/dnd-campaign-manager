import AbilitiesSection from "../sections/AbilitiesSection";
import AbilityScoresSection from "../sections/AbilityScoresSection";
import AttacksBlock from "../fields/AttacksBlock";
import ConditionsSection from "../sections/ConditionsSection";
import MonsterStatsSection from "../sections/MonsterStatsSection";
import ResourcePoolsSection from "../sections/ResourcePoolsSection";
import VitalsSection from "../sections/VitalsSection";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const MonsterEditorBody = (props: EditorBodyProps) => (
  <>
    <VitalsSection {...props} />
    <MonsterStatsSection {...props} />
    <AbilityScoresSection {...props} />
    <AttacksBlock
      attacks={props.draft.attacks}
      editable={props.canEditOwn}
      onChange={(attacks) => props.updateDraft({ attacks })}
    />
    <AbilitiesSection {...props} />
    <ResourcePoolsSection {...props} />
    <ConditionsSection {...props} />
  </>
);

export default MonsterEditorBody;
