import { useState } from "react";
import CommonButton from "../../ui/buttons/CommonButton";
import ConfirmDialog from "../../ui/ConfirmDialog";
import CreateInvite from "./CreateInvite";
import { useCampaignCharacters } from "./characters/controller/useCampaignCharacters";

type CampaignActionsPanelProps = {
  campaignId: string;
  isDM: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onDeleteCampaign: () => void;
};

function CampaignActionsPanel({
  campaignId,
  isDM,
  hasChanges,
  onSave,
  onDeleteCampaign,
}: CampaignActionsPanelProps) {
  const { characters, myCharacter, openCharactersSidebar, openMyCharacter } =
    useCampaignCharacters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteCampaign();
  };

  return (
    <div className="cs-section-card flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {isDM ? (
          <CommonButton onClick={openCharactersSidebar} size="sm">
            Characters ({characters.length})
          </CommonButton>
        ) : (
          <CommonButton onClick={openMyCharacter} size="sm">
            {myCharacter ? "My character" : "Create character"}
          </CommonButton>
        )}
        {isDM && hasChanges && (
          <CommonButton onClick={onSave} variant="accept" size="sm">
            Save
          </CommonButton>
        )}
        {isDM && (
          <CommonButton
            onClick={() => setShowDeleteConfirm(true)}
            variant="decline"
            size="sm"
          >
            Delete
          </CommonButton>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="h-px w-full bg-rule/60" />
        <CreateInvite campaignId={campaignId} />
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Campaign"
          message="Are you sure you want to delete this campaign? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

export default CampaignActionsPanel;
