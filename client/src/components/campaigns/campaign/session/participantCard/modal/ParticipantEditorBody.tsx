import MonsterEditorBody from "./bodies/MonsterEditorBody";
import NpcEditorBody from "./bodies/NpcEditorBody";
import PcEditorBody from "./bodies/PcEditorBody";
import type { EditorBodyProps } from "../../../../../../types/components/participantCard";

export const ParticipantEditorBody = (props: EditorBodyProps) => {
  switch (props.draft.type) {
    case "pc":
      return <PcEditorBody {...props} />;
    case "npc":
      return <NpcEditorBody {...props} />;
    case "monster":
      return <MonsterEditorBody {...props} />;
  }
};

export default ParticipantEditorBody;
