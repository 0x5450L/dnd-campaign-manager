import { getIo } from "../socket";
import type {
  EncounterDTO,
  EncounterParticipantDTO,
} from "../../../../shared/dto/session";

export const broadcastEncounterUpdated = (
  campaignId: string,
  encounter: EncounterDTO,
) => {
  getIo()
    .to(`campaign:${campaignId}`)
    .emit("encounter_updated", { campaignId, encounter });
};

export const broadcastParticipantRemoved = (
  campaignId: string,
  encounterId: string,
  participantId: string,
) => {
  getIo()
    .to(`campaign:${campaignId}`)
    .emit("participant_removed", { campaignId, encounterId, participantId });
};

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
      socket.emit("participant_updated", { campaignId, encounterId, participant });
    } else if (wasVisible) {
      socket.emit("participant_removed", {
        campaignId,
        encounterId,
        participantId: participant.id,
      });
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
    socket.emit("initiative_updated", { campaignId, encounterId, participants: list });
  }
};
