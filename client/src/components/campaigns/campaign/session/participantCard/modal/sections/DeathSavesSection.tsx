import { incrementDeathSave } from "@/utils/encounterParticipant";
import DeathSavesBlock from "@/components/campaigns/campaign/session/participantCard/blocks/DeathSavesBlock";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const DeathSavesSection = ({ participant, patchParticipant, canEditOwn }: EditorBodyProps) => {
  const hasDeathSaves = participant.deathSaveSuccesses > 0 || participant.deathSaveFailures > 0;

  return (
    <div className="flex flex-col gap-1">
      <DeathSavesBlock
        successes={participant.deathSaveSuccesses}
        failures={participant.deathSaveFailures}
        canEdit={canEditOwn}
        onRecord={(outcome) => patchParticipant(incrementDeathSave(participant, outcome))}
      />
      {canEditOwn && (
        <button
          type="button"
          onClick={() => patchParticipant({ deathSaveSuccesses: 0, deathSaveFailures: 0 })}
          disabled={!hasDeathSaves}
          className="self-end text-xs sm:text-sm uppercase tracking-widest text-faint transition-colors hover:text-ink disabled:opacity-40"
        >
          Reset saves
        </button>
      )}
    </div>
  );
};

export default DeathSavesSection;
