import {
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { LiveSessionContext, type LiveSessionContextType } from "./LiveSessionContext";
import {
  initialLiveSessionState,
  liveSessionReducer,
} from "../../state/liveSession/liveSessionReducer";
import type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  MemberPresence,
  PresenceStatus,
} from "../../types/session";
import type { Campaign } from "../../types/campaigns";

type Props = {
  campaign: Campaign;
  children: ReactNode;
};

const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const seedPresence = (campaign: Campaign): MemberPresence[] =>
  campaign.members.map((m, idx) => ({
    userId: m.userId,
    status: idx === 0 ? "connected" : ("offline" as PresenceStatus),
  }));

const seedSession = (campaign: Campaign): CampaignSessionDTO => {
  const now = new Date().toISOString();
  return {
    id: newId("session"),
    number: 1,
    status: "active",
    title: "Session in progress",
    summary: null,
    notes: null,
    campaignId: campaign.id,
    startedAt: now,
    updatedAt: now,
    endedAt: null,
  };
};

const seedEncounter = (campaignSessionId: string): EncounterDTO => {
  const now = new Date().toISOString();
  return {
    id: newId("enc"),
    name: "Goblin Ambush",
    status: "active",
    round: 1,
    currentTurnIndex: 0,
    campaignSessionId,
    startedAt: now,
    updatedAt: now,
    endedAt: null,
  };
};

const seedParticipants = (
  encounterId: string,
  campaign: Campaign,
): EncounterParticipantDTO[] => {
  const now = new Date().toISOString();
  const players: EncounterParticipantDTO[] = campaign.members
    .filter((m) => m.role === "player")
    .slice(0, 4)
    .map((m, idx) => ({
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "pc",
      name: m.user.displayName,
      sortOrder: 18 - idx * 2,
      maxHp: 28 + idx * 4,
      currentHp: 28 + idx * 4,
      tempHp: 0,
      armorClass: 15 + (idx % 3),
      attacks: [],
      conditions: [],
      isVisible: true,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    }));

  const monsters: EncounterParticipantDTO[] = [
    {
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "monster",
      name: "Goblin Boss",
      sortOrder: 17,
      maxHp: 21,
      currentHp: 21,
      tempHp: 0,
      armorClass: 17,
      attacks: [],
      conditions: [],
      isVisible: true,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "monster",
      name: "Goblin Scout A",
      sortOrder: 14,
      maxHp: 7,
      currentHp: 7,
      tempHp: 0,
      armorClass: 13,
      attacks: [],
      conditions: [],
      isVisible: true,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "monster",
      name: "Goblin Scout B",
      sortOrder: 12,
      maxHp: 7,
      currentHp: 7,
      tempHp: 0,
      armorClass: 13,
      attacks: [],
      conditions: [],
      isVisible: true,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return [...players, ...monsters].sort((a, b) => b.sortOrder - a.sortOrder);
};

export const LiveSessionProvider = ({ campaign, children }: Props) => {
  const [state, dispatch] = useReducer(liveSessionReducer, initialLiveSessionState);

  const startSession = useCallback(() => {
    dispatch({
      type: "START_SESSION",
      session: seedSession(campaign),
      presence: seedPresence(campaign),
    });
  }, [campaign]);

  const endSession = useCallback(() => {
    dispatch({ type: "END_SESSION" });
  }, []);

  const togglePresence = useCallback(
    (userId: string) => {
      const current =
        state.presence.find((p) => p.userId === userId)?.status ?? "offline";
      const next: PresenceStatus =
        current === "connected" ? "offline" : "connected";
      dispatch({ type: "SET_PRESENCE", userId, status: next });
      const member = campaign.members.find((m) => m.userId === userId);
      if (member) {
        dispatch({
          type: "LOG_EVENT",
          kind: next === "connected" ? "member_joined" : "member_left",
          message: `${member.user.displayName} ${
            next === "connected" ? "joined the session" : "left the session"
          }`,
        });
      }
    },
    [state.presence, campaign.members],
  );

  const startEncounter = useCallback(() => {
    if (!state.session) return;
    const encounter = seedEncounter(state.session.id);
    const participants = seedParticipants(encounter.id, campaign);
    dispatch({ type: "START_ENCOUNTER", encounter, participants });
  }, [state.session, campaign]);

  const endEncounter = useCallback(() => {
    dispatch({ type: "END_ENCOUNTER" });
  }, []);

  const advanceTurn = useCallback(() => {
    dispatch({ type: "ADVANCE_TURN" });
  }, []);

  const adjustHp = useCallback((participantId: string, delta: number) => {
    dispatch({ type: "ADJUST_HP", participantId, delta });
  }, []);

  const toggleCondition = useCallback(
    (participantId: string, condition: string) => {
      dispatch({ type: "TOGGLE_CONDITION", participantId, condition });
    },
    [],
  );

  const presenceFor = useCallback(
    (userId: string): PresenceStatus =>
      state.presence.find((p) => p.userId === userId)?.status ?? "offline",
    [state.presence],
  );

  const activeParticipant = useMemo(() => {
    if (!state.encounter || state.participants.length === 0) return null;
    return state.participants[state.encounter.currentTurnIndex] ?? null;
  }, [state.encounter, state.participants]);

  const connectedCount = useMemo(
    () => state.presence.filter((p) => p.status === "connected").length,
    [state.presence],
  );

  const value = useMemo<LiveSessionContextType>(
    () => ({
      session: state.session,
      encounter: state.encounter,
      participants: state.participants,
      presence: state.presence,
      events: state.events,

      presenceFor,
      activeParticipant,
      connectedCount,

      startSession,
      endSession,
      togglePresence,
      startEncounter,
      endEncounter,
      advanceTurn,
      adjustHp,
      toggleCondition,
    }),
    [
      state,
      presenceFor,
      activeParticipant,
      connectedCount,
      startSession,
      endSession,
      togglePresence,
      startEncounter,
      endEncounter,
      advanceTurn,
      adjustHp,
      toggleCondition,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
};
