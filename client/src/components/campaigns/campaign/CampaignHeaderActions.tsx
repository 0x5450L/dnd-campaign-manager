import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonButton from "../../ui/buttons/CommonButton";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { useCampaignCharacters } from "./characters/controller/useCampaignCharacters";

type CampaignHeaderActionsProps = {
  isDM: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onDeleteCampaign: () => void;
};

function CampaignHeaderActions({
  isDM,
  hasChanges,
  onSave,
  onDeleteCampaign,
}: CampaignHeaderActionsProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { characters, myCharacter, openCharactersSidebar, openMyCharacter } = useCampaignCharacters();

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteCampaign();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <CommonButton onClick={() => navigate("/campaigns")} variant="secondary" size="sm">
        &larr; To Campaigns
      </CommonButton>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        {isDM ? (
          <CommonButton onClick={openCharactersSidebar} size="sm">
            Characters ({characters.length})
          </CommonButton>
        ) : (
          <CommonButton onClick={openMyCharacter} size="sm">
            {myCharacter ? "My Character" : "Create Character"}
          </CommonButton>
        )}

        {isDM && (
          <>
            {hasChanges && (
              <CommonButton onClick={onSave} size="sm">
                Save
              </CommonButton>
            )}
            <CommonButton onClick={() => setShowDeleteConfirm(true)} variant="decline" size="sm">
              Delete Campaign
            </CommonButton>
          </>
        )}
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

export default CampaignHeaderActions;