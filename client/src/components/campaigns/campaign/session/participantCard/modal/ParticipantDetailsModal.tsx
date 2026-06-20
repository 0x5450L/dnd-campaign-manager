import { useEffect, useRef, useState } from "react";
import type { EncounterParticipantDTO } from "../../../../../../types/encounter";
import { diffParticipant } from "../../../../../../utils/encounterParticipant";
import { useLiveSession } from "../../../../../../context/liveSessionContext/useLiveSession";
import TypeBadge from "../blocks/TypeBadge";
import VisibilityToggle from "../blocks/VisibilityToggle";
import { CheckIcon, CloseIcon } from "../blocks/icons";
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
  const { updateParticipant } = useLiveSession();

  const canManage = isDM;
  const canEditOwn = isDM || isOwner;

  const [savedParticipant, setSavedParticipant] = useState(participant);
  const [draft, setDraft] = useState(participant);
  const externalRef = useRef(participant);

  const updateDraft = (fields: Partial<EncounterParticipantDTO>) =>
    setDraft((current) => ({ ...current, ...fields }));

  const pendingPatch = diffParticipant(savedParticipant, draft);
  const hasUnsavedChanges = Object.keys(pendingPatch).length > 0;

  useEffect(() => {
    setDraft((currentDraft) => {
      const localChanges = diffParticipant(externalRef.current, currentDraft);
      const merged: EncounterParticipantDTO = { ...participant };
      for (const key of Object.keys(localChanges)) {
        (merged as Record<string, unknown>)[key] = (currentDraft as Record<string, unknown>)[key];
      }
      return merged;
    });
    setSavedParticipant(participant);
    externalRef.current = participant;
  }, [participant]);

  const commitChanges = () => {
    if (!hasUnsavedChanges) return;
    updateParticipant(participant.id, pendingPatch);
    setSavedParticipant(draft);
  };

  const saveAndClose = () => {
    if (hasUnsavedChanges) updateParticipant(participant.id, pendingPatch);
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") saveAndClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={saveAndClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative flex max-h-[85vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-md border border-rule bg-surface p-4 shadow-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <EditableText
            value={draft.name}
            editable={canEditOwn}
            onCommit={(name) => updateDraft({ name })}
            ariaLabel="Participant name"
            className={`w-full truncate font-fantasy text-xl sm:text-2xl font-bold text-gold-bright ${
              canEditOwn ? "rounded border-b border-transparent focus:border-rule" : ""
            }`}
          />
          <div className="flex shrink-0 items-center gap-2">
            <TypeBadge type={draft.type} />
            {canManage && (
              <VisibilityToggle
                isVisible={draft.isVisible}
                onToggle={() => updateDraft({ isVisible: !draft.isVisible })}
              />
            )}
            {canEditOwn && hasUnsavedChanges && (
              <button
                type="button"
                onClick={commitChanges}
                aria-label="Save changes"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-leaf/70 bg-leaf/15 text-leaf-soft transition-colors hover:bg-leaf/25 hover:brightness-110"
              >
                <CheckIcon />
              </button>
            )}
            <button
              type="button"
              onClick={saveAndClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <ParticipantEditorBody
          draft={draft}
          updateDraft={updateDraft}
          canEditOwn={canEditOwn}
          canManage={canManage}
        />
      </div>
    </div>
  );
};

export default ParticipantDetailsModal;
