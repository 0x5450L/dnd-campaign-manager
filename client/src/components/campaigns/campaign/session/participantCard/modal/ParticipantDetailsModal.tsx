import type { EncounterParticipantDTO, UpdateParticipantPayload } from "@/types/encounter";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";
import Modal from "@/components/ui/Modal";
import TypeBadge from "../blocks/TypeBadge";
import VisibilityToggle from "../blocks/VisibilityToggle";
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

  return (
    <Modal
      onClose={onClose}
      label={participant.name}
      title={
        <EditableText
          value={participant.name}
          editable={canEditOwn}
          onCommit={(name) => patchParticipant({ name })}
          ariaLabel="Participant name"
          className={`w-full truncate font-fantasy text-xl sm:text-2xl font-bold text-gold-bright ${
            canEditOwn ? "rounded border-b border-transparent focus:border-rule" : ""
          }`}
        />
      }
      actions={
        <>
          <TypeBadge type={participant.type} />
          {canManage && (
            <VisibilityToggle
              isVisible={participant.isVisible}
              onToggle={() => patchParticipant({ isVisible: !participant.isVisible })}
            />
          )}
        </>
      }
    >
      <ParticipantEditorBody
        participant={participant}
        patchParticipant={patchParticipant}
        canEditOwn={canEditOwn}
        canManage={canManage}
      />
    </Modal>
  );
};

export default ParticipantDetailsModal;
