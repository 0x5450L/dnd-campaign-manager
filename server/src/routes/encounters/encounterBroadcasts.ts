import { getIo } from "../../services/socket";
import type { EncounterParticipantDTO } from "../../../../shared/session";

export const broadcastParticipantUpdate = async (
  campaignId: string,
  dmId: string,
  encounterId: string,
  participant: EncounterParticipantDTO,
  wasVisible: boolean,
) => {
  const sockets = await getIo().in(`campaign:${campaignId}`).fetchSockets();
  for (const socket of sockets) {
    const isDM = socket.data.userId === dmId;
    if (isDM || participant.isVisible) {
      socket.emit('participant_updated', { campaignId, encounterId, participant });
    } else if (wasVisible) {
      socket.emit('participant_removed', { campaignId, encounterId, participantId: participant.id });
    }
  }
};

export const broadcastInitiative = async (
  campaignId: string,
  dmId: string,
  encounterId: string,
  participants: EncounterParticipantDTO[],
) => {
  const sockets = await getIo().in(`campaign:${campaignId}`).fetchSockets();
  const visibleOnly = participants.filter((p) => p.isVisible);
  for (const socket of sockets) {
    const list = socket.data.userId === dmId ? participants : visibleOnly;
    socket.emit('initiative_updated', { campaignId, encounterId, participants: list });
  }
};
