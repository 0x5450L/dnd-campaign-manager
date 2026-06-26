import { notifyClient } from "../sseClients";

type MemberWithEmail = { user: { email: string } };

export const notifyCharacterCreated = (
  members: MemberWithEmail[],
  characterId: string,
  campaignId: string,
) => {
  members.forEach((member) => {
    notifyClient(member.user.email, {
      type: "character_created",
      characterId,
      campaignId,
    });
  });
};

export const notifyCharacterUpdated = (
  members: MemberWithEmail[],
  character: { id: string; campaignId: string },
  campaignId: string,
) => {
  members.forEach((member) => {
    notifyClient(member.user.email, {
      type: "character_updated",
      characterId: character.id,
      campaignId,
      character,
    });
  });
};

export const notifyCharacterDeleted = (
  members: MemberWithEmail[],
  characterId: string,
  campaignId: string,
) => {
  members.forEach((member) => {
    notifyClient(member.user.email, {
      type: "character_deleted",
      characterId,
      campaignId,
    });
  });
};
