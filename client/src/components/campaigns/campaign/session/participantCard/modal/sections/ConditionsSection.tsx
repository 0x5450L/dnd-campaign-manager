import { toggleConditionInList } from "../../../../../../../utils/encounterParticipant";
import ConditionsPicker from "../../blocks/ConditionsPicker";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";

export const ConditionsSection = ({ draft, updateDraft, canEditOwn }: EditorBodyProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">Conditions</span>
    <ConditionsPicker
      active={draft.conditions}
      isDM={canEditOwn}
      onToggle={(condition) =>
        updateDraft({ conditions: toggleConditionInList(draft.conditions, condition) })
      }
    />
  </div>
);

export default ConditionsSection;
