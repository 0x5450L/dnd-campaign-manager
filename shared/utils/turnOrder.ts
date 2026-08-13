type Identified = { id: string };

export type TurnResolution<T> = {
  participant: T | null;
  wrapped: boolean;
};

export const nextTurn = <T extends Identified>(
  participants: T[],
  currentId: string | null,
): TurnResolution<T> => {
  if (participants.length === 0) {
    return { participant: null, wrapped: false };
  }

  const current = currentId
    ? participants.findIndex((participant) => participant.id === currentId)
    : -1;

  if (current === -1) {
    return { participant: participants[0], wrapped: false };
  }

  const next = current + 1;
  const wrapped = next >= participants.length;

  return { participant: wrapped ? participants[0] : participants[next], wrapped };
};

export const turnAfterRemoval = <T extends Identified>(
  participants: T[],
  currentId: string | null,
  removedIds: string[],
): TurnResolution<T> => {
  const removed = new Set(removedIds);

  if (!currentId || !removed.has(currentId)) {
    const current = participants.find((participant) => participant.id === currentId);
    return { participant: current ?? null, wrapped: false };
  }

  const current = participants.findIndex((participant) => participant.id === currentId);
  const successor = participants
    .slice(current + 1)
    .find((participant) => !removed.has(participant.id));

  if (successor) {
    return { participant: successor, wrapped: false };
  }

  const survivor = participants.find((participant) => !removed.has(participant.id));

  return survivor
    ? { participant: survivor, wrapped: true }
    : { participant: null, wrapped: false };
};
