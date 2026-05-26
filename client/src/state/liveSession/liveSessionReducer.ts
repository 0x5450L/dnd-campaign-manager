import type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  MemberPresence,
  ParticipantType,
  PresenceStatus,
  SessionEvent,
  SessionEventKind,
} from "../../types/session";

export type LiveSessionState = {
  session: CampaignSessionDTO | null;
  encounter: EncounterDTO | null;
  participants: EncounterParticipantDTO[];
  presence: MemberPresence[];
  events: SessionEvent[];
};

export type LiveSessionAction =
  | { type: "START_SESSION"; session: CampaignSessionDTO; presence: MemberPresence[] }
  | { type: "END_SESSION" }
  | { type: "SET_PRESENCE"; userId: string; status: PresenceStatus }
  | { type: "START_ENCOUNTER"; encounter: EncounterDTO; participants: EncounterParticipantDTO[] }
  | { type: "END_ENCOUNTER" }
  | { type: "ADVANCE_TURN" }
  | { type: "ADJUST_HP"; participantId: string; delta: number }
  | { type: "TOGGLE_CONDITION"; participantId: string; condition: string }
  | { type: "ADD_PARTICIPANT"; participant: EncounterParticipantDTO }
  | { type: "REMOVE_PARTICIPANT"; participantId: string }
  | {
      type: "LOG_EVENT";
      kind: SessionEventKind;
      message: string;
      actorName?: string;
    };

export const EVENT_LIMIT = 40;

export const initialLiveSessionState: LiveSessionState = {
  session: null,
  encounter: null,
  participants: [],
  presence: [],
  events: [],
};

const makeEvent = (
  kind: SessionEventKind,
  message: string,
  actorName?: string,
): SessionEvent => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  kind,
  message,
  actorName,
  at: new Date().toISOString(),
});

const pushEvent = (events: SessionEvent[], event: SessionEvent): SessionEvent[] =>
  [event, ...events].slice(0, EVENT_LIMIT);

const clampHp = (value: number, max: number) =>
  Math.max(0, Math.min(value, max));

export const liveSessionReducer = (
  state: LiveSessionState,
  action: LiveSessionAction,
): LiveSessionState => {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...state,
        session: action.session,
        presence: action.presence,
        events: pushEvent(state.events, makeEvent("session_started", "Session started")),
      };

    case "END_SESSION":
      return {
        ...state,
        session: null,
        encounter: null,
        participants: [],
        presence: state.presence.map((p) => ({ ...p, status: "offline" as PresenceStatus })),
        events: pushEvent(state.events, makeEvent("session_ended", "Session ended")),
      };

    case "SET_PRESENCE": {
      const exists = state.presence.some((p) => p.userId === action.userId);
      const presence = exists
        ? state.presence.map((p) =>
            p.userId === action.userId ? { ...p, status: action.status } : p,
          )
        : [...state.presence, { userId: action.userId, status: action.status }];
      return { ...state, presence };
    }

    case "START_ENCOUNTER":
      return {
        ...state,
        encounter: action.encounter,
        participants: [...action.participants].sort((a, b) => b.sortOrder - a.sortOrder),
        events: pushEvent(
          state.events,
          makeEvent("encounter_started", `Encounter "${action.encounter.name ?? "Untitled"}" started`),
        ),
      };

    case "END_ENCOUNTER":
      return {
        ...state,
        encounter: state.encounter ? { ...state.encounter, status: "ended" } : null,
        events: pushEvent(state.events, makeEvent("encounter_ended", "Encounter ended")),
      };

    case "ADVANCE_TURN": {
      if (!state.encounter || state.participants.length === 0) return state;
      const total = state.participants.length;
      const nextIndex = (state.encounter.currentTurnIndex + 1) % total;
      const nextRound =
        nextIndex === 0 ? state.encounter.round + 1 : state.encounter.round;
      const upcoming = state.participants[nextIndex];
      return {
        ...state,
        encounter: {
          ...state.encounter,
          currentTurnIndex: nextIndex,
          round: nextRound,
        },
        events: pushEvent(
          state.events,
          makeEvent("turn_advanced", `${upcoming.name}'s turn (round ${nextRound})`),
        ),
      };
    }

    case "ADJUST_HP": {
      const target = state.participants.find((p) => p.id === action.participantId);
      if (!target) return state;
      const next = clampHp(target.currentHp + action.delta, target.maxHp);
      const participants = state.participants.map((p) =>
        p.id === action.participantId ? { ...p, currentHp: next } : p,
      );
      const verb = action.delta < 0 ? "took" : "healed";
      const amount = Math.abs(action.delta);
      return {
        ...state,
        participants,
        events: pushEvent(
          state.events,
          makeEvent(
            "hp_changed",
            `${target.name} ${verb} ${amount} (${next}/${target.maxHp})`,
          ),
        ),
      };
    }

    case "TOGGLE_CONDITION": {
      const target = state.participants.find((p) => p.id === action.participantId);
      if (!target) return state;
      const had = target.conditions.includes(action.condition);
      const conditions = had
        ? target.conditions.filter((c) => c !== action.condition)
        : [...target.conditions, action.condition];
      const participants = state.participants.map((p) =>
        p.id === action.participantId ? { ...p, conditions } : p,
      );
      return {
        ...state,
        participants,
        events: pushEvent(
          state.events,
          makeEvent(
            had ? "condition_removed" : "condition_added",
            `${target.name} ${had ? "lost" : "gained"} condition: ${action.condition}`,
          ),
        ),
      };
    }

    case "ADD_PARTICIPANT":
      return {
        ...state,
        participants: [...state.participants, action.participant].sort(
          (a, b) => b.sortOrder - a.sortOrder,
        ),
      };

    case "REMOVE_PARTICIPANT":
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.participantId),
      };

    case "LOG_EVENT":
      return {
        ...state,
        events: pushEvent(
          state.events,
          makeEvent(action.kind, action.message, action.actorName),
        ),
      };
  }
};

export type { ParticipantType };
