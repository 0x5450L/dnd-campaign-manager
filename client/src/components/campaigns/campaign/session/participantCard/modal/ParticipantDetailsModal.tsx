import { useEffect } from "react";
import type { EncounterParticipantDTO, UpdateParticipantPayload } from "@/types/encounter";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";
import TypeBadge from "../blocks/TypeBadge";
import VisibilityToggle from "../blocks/VisibilityToggle";
import { CloseIcon } from "../blocks/icons";
import EditableText from "./EditableText";
import ParticipantEditorBody from "./ParticipantEditorBody";

type ParticipantDetailsModalProps = {
  participant: EncounterParticipantDTO;
  isDM: boolean;
  isOwner: boolean;
  onClose: () => void;
};

export const ParticipantDetailsModal = ({
  participant,
  isDM,
  isOwner,
  onClose,
}: ParticipantDetailsModalProps) => {
  const { updateParticipant } = useParticipantActions();

  const canManage = isDM;
  const canEditOwn = isDM || isOwner;

  const patchParticipant = (fields: UpdateParticipantPayload) =>
    updateParticipant(participant.id, fields);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative flex max-h-[85vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-md border border-rule bg-surface p-4 shadow-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <EditableText
            value={participant.name}
            editable={canEditOwn}
            onCommit={(name) => patchParticipant({ name })}
            ariaLabel="Participant name"
            className={`w-full truncate font-fantasy text-xl sm:text-2xl font-bold text-gold-bright ${
              canEditOwn ? "rounded border-b border-transparent focus:border-rule" : ""
            }`}
          />
          <div className="flex shrink-0 items-center gap-2">
            <TypeBadge type={participant.type} />
            {canManage && (
              <VisibilityToggle
                isVisible={participant.isVisible}
                onToggle={() => patchParticipant({ isVisible: !participant.isVisible })}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <ParticipantEditorBody
          participant={participant}
          patchParticipant={patchParticipant}
          canEditOwn={canEditOwn}
          canManage={canManage}
        />
      </div>
    </div>
  );
};

export default ParticipantDetailsModal;
