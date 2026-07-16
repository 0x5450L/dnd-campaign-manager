import { incrementDeathSave } from "@/utils/encounterParticipant";
import DeathSavesBlock from "@/components/campaigns/campaign/session/participantCard/blocks/DeathSavesBlock";
import type { EditorBodyProps } from "@/types/components/participantCard";

export const DeathSavesSection = ({ draft, updateDraft, canEditOwn }: EditorBodyProps) => {
  const hasDeathSaves = draft.deathSaveSuccesses > 0 || draft.deathSaveFailures > 0;

  return (
    <div className="flex flex-col gap-1">
      <DeathSavesBlock
        successes={draft.deathSaveSuccesses}
        failures={draft.deathSaveFailures}
        canEdit={canEditOwn}
        onRecord={(outcome) => updateDraft(incrementDeathSave(draft, outcome))}
      />
      {canEditOwn && (
        <button
          type="button"
          onClick={() => updateDraft({ deathSaveSuccesses: 0, deathSaveFailures: 0 })}
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
