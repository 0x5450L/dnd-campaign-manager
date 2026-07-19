import { toggleConditionInList } from "@/utils/encounterParticipant";
import ConditionsPicker from "@/components/campaigns/campaign/session/participantCard/blocks/ConditionsPicker";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const ConditionsSection = ({ participant, patchParticipant, canEditOwn }: EditorBodyProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">Conditions</span>
    <ConditionsPicker
      active={participant.conditions}
      isDM={canEditOwn}
      onToggle={(condition) =>
        patchParticipant({ conditions: toggleConditionInList(participant.conditions, condition) })
      }
    />
  </div>
);

export default ConditionsSection;
