import { getIo } from "../socket";
import type {
  EncounterDTO,
  EncounterParticipantDTO,
} from "../../../../shared/dto/session";
import type { RechargeRollDTO } from "../../../../shared/dto/socketEvents";
import type { InitiativeRollDTO } from "../../../../shared/dto/session";

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

export const broadcastTurnAdvanced = async (
  campaignId: string,
  dmId: string,
  encounter: EncounterDTO,
  participant: EncounterParticipantDTO | null,
  rechargeRolls: RechargeRollDTO[],
) => {
  const sockets = await getIo().in(`campaign:${campaignId}`).fetchSockets();
  for (const socket of sockets) {
    const isDM = socket.data.userId === dmId;
    const showParticipant = participant !== null && (isDM || participant.isVisible);
    socket.emit("turn_advanced", {
      campaignId,
      encounter,
      participant: showParticipant ? participant : null,
      rechargeRolls: showParticipant ? rechargeRolls : [],
    });
  }
};

export const broadcastInitiative = async (
  campaignId: string,
  dmId: string,
  encounterId: string,
  participants: EncounterParticipantDTO[],
  rolls?: InitiativeRollDTO[],
) => {
  const sockets = await getIo().in(`campaign:${campaignId}`).fetchSockets();
  const visibleOnly = participants.filter((p) => p.isVisible);
  const visibleIds = new Set(visibleOnly.map((p) => p.id));
  const visibleRolls = rolls?.filter((roll) => visibleIds.has(roll.participantId));
  for (const socket of sockets) {
    const isDM = socket.data.userId === dmId;
    socket.emit("initiative_updated", {
      campaignId,
      encounterId,
      participants: isDM ? participants : visibleOnly,
      rolls: isDM ? rolls : visibleRolls,
    });
  }
};
