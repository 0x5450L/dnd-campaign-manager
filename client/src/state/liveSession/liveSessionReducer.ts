import type {
  CampaignSessionDTO,
  MemberPresence,
  SessionDiceRoll,
  SessionEvent,
  SessionEventKind,
} from "../../types/session";
import type {
  EncounterDTO,
  EncounterParticipantDTO,
  ParticipantType,
} from "../../types/encounter";
import { clamp } from "../../utils/dndMath";

export type LiveSessionState = {
  session: CampaignSessionDTO | null;
  encounter: EncounterDTO | null;
  participants: EncounterParticipantDTO[];
  presence: MemberPresence[];
  events: SessionEvent[];
  rolls: SessionDiceRoll[];
};

export type SessionRollInput = Omit<SessionDiceRoll, "id" | "at" | "actorName">;

export type ParticipantPatch = Partial<
  Omit<EncounterParticipantDTO, "id" | "encounterId" | "createdAt" | "updatedAt">
>;

export type LiveSessionAction =
  | { type: "START_SESSION"; session: CampaignSessionDTO }
  | { type: "HYDRATE_SESSION"; session: CampaignSessionDTO }
  | { type: "END_SESSION" }
  | { type: "REPLACE_PRESENCE"; presence: MemberPresence[] }
  | { type: "START_ENCOUNTER"; encounter: EncounterDTO; participants: EncounterParticipantDTO[] }
  | { type: "END_ENCOUNTER" }
  | { type: "ADVANCE_TURN" }
  | { type: "ADJUST_HP"; participantId: string; delta: number }
  | { type: "GRANT_TEMP_HP"; participantId: string; amount: number }
  | { type: "TOGGLE_CONDITION"; participantId: string; condition: string }
  | { type: "SET_VISIBILITY"; participantId: string; isVisible: boolean }
  | { type: "SET_AC_HIDDEN"; participantId: string; acHidden: boolean }
  | {
      type: "RECORD_DEATH_SAVE";
      participantId: string;
      outcome: "success" | "failure";
    }
  | { type: "RESET_DEATH_SAVES"; participantId: string }
  | { type: "UPDATE_PARTICIPANT"; participantId: string; patch: ParticipantPatch }
  | { type: "ADD_PARTICIPANT"; participant: EncounterParticipantDTO }
  | { type: "REMOVE_PARTICIPANT"; participantId: string }
  | { type: "ROLL_LOGGED"; roll: SessionDiceRoll }
  | {
      type: "LOG_EVENT";
      kind: SessionEventKind;
      message: string;
      actorName?: string;
    };

export const EVENT_LIMIT = 40;
export const ROLL_LIMIT = 30;

export const initialLiveSessionState: LiveSessionState = {
  session: null,
  encounter: null,
  participants: [],
  presence: [],
  events: [],
  rolls: [],
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

const clampHp = (value: number, max: number) => clamp(value, 0, max);

export const liveSessionReducer = (
  state: LiveSessionState,
  action: LiveSessionAction,
): LiveSessionState => {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...state,
        session: action.session,
        events: pushEvent(state.events, makeEvent("session_started", "Session started")),
      };

    case "HYDRATE_SESSION":
      return {
        ...initialLiveSessionState,
        session: action.session,
        presence: state.presence,
      };

    case "END_SESSION":
      return {
        ...state,
        session: null,
        encounter: null,
        participants: [],
        rolls: [],
        events: pushEvent(state.events, makeEvent("session_ended", "Session ended")),
      };

    case "REPLACE_PRESENCE":
      return { ...state, presence: action.presence };

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

      let nextTempHp = target.tempHp;
      let nextCurrentHp = target.currentHp;

      if (action.delta < 0) {
        const damage = Math.abs(action.delta);
        const absorbed = Math.min(damage, target.tempHp);
        nextTempHp = target.tempHp - absorbed;
        nextCurrentHp = clampHp(target.currentHp - (damage - absorbed), target.maxHp);
      } else {
        nextCurrentHp = clampHp(target.currentHp + action.delta, target.maxHp);
      }

      const wasDown = target.currentHp === 0;
      const isUp = nextCurrentHp > 0;
      const clearedDeathSaves = wasDown && isUp;

      const participants = state.participants.map((p) =>
        p.id === action.participantId
          ? {
              ...p,
              tempHp: nextTempHp,
              currentHp: nextCurrentHp,
              deathSaveSuccesses: clearedDeathSaves ? 0 : p.deathSaveSuccesses,
              deathSaveFailures: clearedDeathSaves ? 0 : p.deathSaveFailures,
            }
          : p,
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
            `${target.name} ${verb} ${amount} (${nextCurrentHp}/${target.maxHp})`,
          ),
        ),
      };
    }

    case "GRANT_TEMP_HP": {
      const target = state.participants.find((p) => p.id === action.participantId);
      if (!target) return state;
      const next = Math.max(target.tempHp, Math.max(0, action.amount));
      const participants = state.participants.map((p) =>
        p.id === action.participantId ? { ...p, tempHp: next } : p,
      );
      return {
        ...state,
        participants,
        events: pushEvent(
          state.events,
          makeEvent("hp_changed", `${target.name} gained ${next} temp HP`),
        ),
      };
    }

    case "SET_VISIBILITY": {
      const target = state.participants.find((p) => p.id === action.participantId);
      if (!target) return state;
      const participants = state.participants.map((p) =>
        p.id === action.participantId ? { ...p, isVisible: action.isVisible } : p,
      );
      return {
        ...state,
        participants,
        events: pushEvent(
          state.events,
          makeEvent(
            "note",
            `${target.name} is now ${action.isVisible ? "visible" : "hidden"} to players`,
          ),
        ),
      };
    }

    case "SET_AC_HIDDEN": {
      const participants = state.participants.map((p) =>
        p.id === action.participantId ? { ...p, acHidden: action.acHidden } : p,
      );
      return { ...state, participants };
    }

    case "RECORD_DEATH_SAVE": {
      const target = state.participants.find((p) => p.id === action.participantId);
      if (!target) return state;
      const successes =
        action.outcome === "success"
          ? Math.min(3, target.deathSaveSuccesses + 1)
          : target.deathSaveSuccesses;
      const failures =
        action.outcome === "failure"
          ? Math.min(3, target.deathSaveFailures + 1)
          : target.deathSaveFailures;
      const participants = state.participants.map((p) =>
        p.id === action.participantId
          ? { ...p, deathSaveSuccesses: successes, deathSaveFailures: failures }
          : p,
      );
      return {
        ...state,
        participants,
        events: pushEvent(
          state.events,
          makeEvent(
            "note",
            `${target.name} death save ${action.outcome} (${successes}✓ / ${failures}✗)`,
          ),
        ),
      };
    }

    case "UPDATE_PARTICIPANT": {
      const target = state.participants.find((p) => p.id === action.participantId);
      if (!target) return state;
      const merged = { ...target, ...action.patch };
      merged.maxHp = Math.max(1, merged.maxHp);
      merged.currentHp = clampHp(merged.currentHp, merged.maxHp);
      merged.tempHp = Math.max(0, merged.tempHp);
      const participants = state.participants
        .map((p) => (p.id === action.participantId ? merged : p))
        .sort((a, b) => b.sortOrder - a.sortOrder);
      return { ...state, participants };
    }

    case "RESET_DEATH_SAVES": {
      const participants = state.participants.map((p) =>
        p.id === action.participantId
          ? { ...p, deathSaveSuccesses: 0, deathSaveFailures: 0 }
          : p,
      );
      return { ...state, participants };
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

    case "ROLL_LOGGED":
      return {
        ...state,
        rolls: [action.roll, ...state.rolls].slice(0, ROLL_LIMIT),
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
