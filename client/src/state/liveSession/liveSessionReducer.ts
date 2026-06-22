import type {
  CampaignSessionDTO,
  MemberPresence,
  SessionDiceRoll,
  SessionEvent,
  SessionEventKind,
} from "../../types/session";

export type LiveSessionState = {
  session: CampaignSessionDTO | null;
  presence: MemberPresence[];
  events: SessionEvent[];
  rolls: SessionDiceRoll[];
};

export type SessionRollInput = Omit<SessionDiceRoll, "id" | "at" | "actorName">;

export type LiveSessionAction =
  | { type: "START_SESSION"; session: CampaignSessionDTO }
  | { type: "HYDRATE_SESSION"; session: CampaignSessionDTO }
  | { type: "END_SESSION" }
  | { type: "REPLACE_PRESENCE"; presence: MemberPresence[] }
  | { type: "ROLL_LOGGED"; roll: SessionDiceRoll };

export const EVENT_LIMIT = 40;
export const ROLL_LIMIT = 30;

export const initialLiveSessionState: LiveSessionState = {
  session: null,
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
        rolls: [],
        events: pushEvent(state.events, makeEvent("session_ended", "Session ended")),
      };

    case "REPLACE_PRESENCE":
      return { ...state, presence: action.presence };

    case "ROLL_LOGGED":
      return {
        ...state,
        rolls: [action.roll, ...state.rolls].slice(0, ROLL_LIMIT),
      };
  }
};
