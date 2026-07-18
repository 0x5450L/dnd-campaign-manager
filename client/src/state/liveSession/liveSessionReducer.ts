import type {
  CampaignSessionDTO,
  SessionDiceRoll,
  SessionEvent,
  SessionEventKind,
} from "@/types/session";
import type { RechargeRollDTO } from "@shared/dto/socketEvents";
import type { InitiativeRollDTO } from "@shared/dto/session";

export type LiveSessionState = {
  session: CampaignSessionDTO | null;
  isAttendee: boolean;
  connectedUserIds: string[];
  events: SessionEvent[];
  rolls: SessionDiceRoll[];
};

export type SessionRollInput = Omit<SessionDiceRoll, "id" | "at" | "actorName">;

export type LiveSessionAction =
  | { type: "START_SESSION"; session: CampaignSessionDTO }
  | {
      type: "HYDRATE_SESSION";
      session: CampaignSessionDTO;
      isAttendee: boolean;
      rolls: SessionDiceRoll[];
    }
  | { type: "SESSION_JOINED" }
  | { type: "SESSION_LEFT" }
  | {
      type: "ATTENDANCE_CHANGED";
      displayName: string;
      action: "joined" | "left";
    }
  | { type: "END_SESSION" }
  | { type: "RESET" }
  | { type: "REPLACE_PRESENCE"; userIds: string[] }
  | { type: "ROLL_LOGGED"; roll: SessionDiceRoll }
  | {
      type: "TURN_ADVANCED";
      participantName: string | null;
      rechargeRolls: RechargeRollDTO[];
    }
  | { type: "INITIATIVE_ROLLED"; rolls: InitiativeRollDTO[] };

export const EVENT_LIMIT = 40;
export const ROLL_LIMIT = 30;

export const initialLiveSessionState: LiveSessionState = {
  session: null,
  isAttendee: false,
  connectedUserIds: [],
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
        isAttendee: action.isAttendee,
        rolls: action.rolls.slice(0, ROLL_LIMIT),
        connectedUserIds: state.connectedUserIds,
      };

    case "SESSION_JOINED":
      return { ...state, isAttendee: true };

    case "SESSION_LEFT":
      return { ...state, isAttendee: false };

    case "ATTENDANCE_CHANGED":
      return {
        ...state,
        events: pushEvent(
          state.events,
          makeEvent(
            action.action === "joined" ? "member_joined" : "member_left",
            action.action === "joined"
              ? `${action.displayName} joined the session`
              : `${action.displayName} left the session`,
            action.displayName,
          ),
        ),
      };

    case "END_SESSION":
      return {
        ...state,
        session: null,
        isAttendee: false,
        rolls: [],
        events: [],
      };

    case "RESET":
      return initialLiveSessionState;

    case "REPLACE_PRESENCE":
      return { ...state, connectedUserIds: action.userIds };

    case "ROLL_LOGGED":
      return {
        ...state,
        rolls: [action.roll, ...state.rolls].slice(0, ROLL_LIMIT),
      };

    case "TURN_ADVANCED": {
      let events = pushEvent(
        state.events,
        makeEvent(
          "turn_advanced",
          action.participantName ? `Turn: ${action.participantName}` : "Turn advanced",
        ),
      );
      for (const recharge of action.rechargeRolls) {
        events = pushEvent(
          events,
          makeEvent(
            "dice_rolled",
            `${recharge.abilityName}: recharge ${recharge.roll} (${recharge.threshold}+) — ${
              recharge.charged ? "recharged" : "still spent"
            }`,
            action.participantName ?? undefined,
          ),
        );
      }
      return { ...state, events };
    }

    case "INITIATIVE_ROLLED": {
      let events = state.events;
      for (const roll of action.rolls) {
        const sign = roll.modifier >= 0 ? "+" : "";
        events = pushEvent(
          events,
          makeEvent(
            "dice_rolled",
            `${roll.participantName}: initiative ${roll.total} (${roll.roll}${sign}${roll.modifier})`,
            roll.participantName,
          ),
        );
      }
      return { ...state, events };
    }
  }
};
