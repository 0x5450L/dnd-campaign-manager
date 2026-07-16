import { useState } from "react";
import CommonButton from "@/components/ui/buttons/CommonButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CreateInvite from "./CreateInvite";
import { useCampaignCharacters } from "./characters/controller/useCampaignCharacters";

const PANEL_LABEL =
  "font-fantasy text-xs font-bold uppercase tracking-[0.16em] text-gold-bright";

const SUB_PANEL =
  "flex flex-1 flex-col gap-3 rounded-md border border-rule/50 bg-bg/30 p-3";

type CampaignActionsPanelProps = {
  campaignId: string;
  isDM: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onDeleteCampaign: () => void;
  onLeaveCampaign: () => void;
};

function CampaignActionsPanel({
  campaignId,
  isDM,
  hasChanges,
  onSave,
  onDeleteCampaign,
  onLeaveCampaign,
}: CampaignActionsPanelProps) {
  const { characters, myCharacter, isSheetLocked, openCharactersSidebar, openMyCharacter } =
    useCampaignCharacters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteCampaign();
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    onLeaveCampaign();
  };

  return (
    <div className="cs-section-card flex h-full flex-col gap-3 p-4">
      <div className={SUB_PANEL}>
        <span className={PANEL_LABEL}>Manage</span>
        <div className="flex flex-wrap items-center gap-2">
          {isDM ? (
            <CommonButton onClick={openCharactersSidebar} size="sm">
              Characters ({characters.length})
            </CommonButton>
          ) : (
            <CommonButton onClick={openMyCharacter} size="sm" disabled={isSheetLocked}>
              {isSheetLocked
                ? "Locked in combat"
                : myCharacter
                  ? "My character"
                  : "Create character"}
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
          {!isDM && (
            <CommonButton
              onClick={() => setShowLeaveConfirm(true)}
              variant="decline"
              size="sm"
            >
              Leave
            </CommonButton>
          )}
        </div>
      </div>

      <div className={SUB_PANEL}>
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

      {showLeaveConfirm && (
        <ConfirmDialog
          title="Leave Campaign"
          message="Are you sure you want to leave this campaign? Your characters will stay in the campaign."
          confirmLabel="Leave"
          cancelLabel="Cancel"
          onConfirm={handleConfirmLeave}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  );
}

export default CampaignActionsPanel;
