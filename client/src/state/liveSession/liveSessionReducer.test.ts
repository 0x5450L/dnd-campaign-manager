import { describe, expect, it } from "vitest";
import type { CampaignSessionDTO, SessionDiceRoll } from "@/types/session";
import {
  EVENT_LIMIT,
  ROLL_LIMIT,
  initialLiveSessionState,
  liveSessionReducer,
  type LiveSessionAction,
  type LiveSessionState,
} from "./liveSessionReducer";

const session: CampaignSessionDTO = {
  id: "session-1",
  number: 3,
  status: "active",
  title: "Descent into Avernus",
  summary: null,
  notes: null,
  campaignId: "campaign-1",
  startedAt: "2026-08-15T18:00:00.000Z",
  updatedAt: "2026-08-15T18:00:00.000Z",
  endedAt: null,
};

const roll = (id: string): SessionDiceRoll => ({
  id,
  actorName: "Oleg",
  expression: "1d20+5",
  total: 18,
  critSuccess: false,
  critFail: false,
  at: "2026-08-15T18:05:00.000Z",
});

const reduce = (state: LiveSessionState, ...actions: LiveSessionAction[]) =>
  actions.reduce(liveSessionReducer, state);

describe("START_SESSION", () => {
  it("stores the session and logs the start", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "START_SESSION",
      session,
    });

    expect(next.session).toEqual(session);
    expect(next.events).toHaveLength(1);
    expect(next.events[0]).toMatchObject({
      kind: "session_started",
      message: "Session started",
    });
  });

  it("does not make the starter an attendee on its own", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "START_SESSION",
      session,
    });

    expect(next.isAttendee).toBe(false);
  });
});

describe("HYDRATE_SESSION", () => {
  it("adopts the server's view of attendance and rolls", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "HYDRATE_SESSION",
      session,
      isAttendee: true,
      rolls: [roll("r1"), roll("r2")],
    });

    expect(next.session).toEqual(session);
    expect(next.isAttendee).toBe(true);
    expect(next.rolls).toHaveLength(2);
  });

  it("discards events accumulated before the reload", () => {
    const stale = reduce(initialLiveSessionState, {
      type: "ATTENDANCE_CHANGED",
      displayName: "Mira",
      action: "joined",
    });

    const next = liveSessionReducer(stale, {
      type: "HYDRATE_SESSION",
      session,
      isAttendee: false,
      rolls: [],
    });

    expect(next.events).toEqual([]);
  });

  it("preserves presence, which is owned by the socket rather than the fetch", () => {
    const withPresence = liveSessionReducer(initialLiveSessionState, {
      type: "REPLACE_PRESENCE",
      userIds: ["user-1", "user-2"],
    });

    const next = liveSessionReducer(withPresence, {
      type: "HYDRATE_SESSION",
      session,
      isAttendee: false,
      rolls: [],
    });

    expect(next.connectedUserIds).toEqual(["user-1", "user-2"]);
  });

  it("truncates the roll history to the retained window", () => {
    const rolls = Array.from({ length: ROLL_LIMIT + 10 }, (_, i) => roll(`r${i}`));

    const next = liveSessionReducer(initialLiveSessionState, {
      type: "HYDRATE_SESSION",
      session,
      isAttendee: false,
      rolls,
    });

    expect(next.rolls).toHaveLength(ROLL_LIMIT);
    expect(next.rolls[0].id).toBe("r0");
  });
});

describe("attendance", () => {
  it("SESSION_JOINED and SESSION_LEFT flip the attendee flag", () => {
    const joined = liveSessionReducer(initialLiveSessionState, { type: "SESSION_JOINED" });
    expect(joined.isAttendee).toBe(true);
    expect(liveSessionReducer(joined, { type: "SESSION_LEFT" }).isAttendee).toBe(false);
  });

  it("logs another member joining without touching own attendance", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "ATTENDANCE_CHANGED",
      displayName: "Mira",
      action: "joined",
    });

    expect(next.isAttendee).toBe(false);
    expect(next.events[0]).toMatchObject({
      kind: "member_joined",
      message: "Mira joined the session",
      actorName: "Mira",
    });
  });

  it("logs another member leaving", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "ATTENDANCE_CHANGED",
      displayName: "Mira",
      action: "left",
    });

    expect(next.events[0]).toMatchObject({
      kind: "member_left",
      message: "Mira left the session",
    });
  });
});

describe("END_SESSION", () => {
  it("clears the session, attendance, rolls and events", () => {
    const live = reduce(
      initialLiveSessionState,
      { type: "START_SESSION", session },
      { type: "SESSION_JOINED" },
      { type: "ROLL_LOGGED", roll: roll("r1") },
    );

    const next = liveSessionReducer(live, { type: "END_SESSION" });

    expect(next.session).toBeNull();
    expect(next.isAttendee).toBe(false);
    expect(next.rolls).toEqual([]);
    expect(next.events).toEqual([]);
  });

  it("leaves presence intact, since the socket is still connected", () => {
    const live = reduce(
      initialLiveSessionState,
      { type: "START_SESSION", session },
      { type: "REPLACE_PRESENCE", userIds: ["user-1"] },
    );

    expect(liveSessionReducer(live, { type: "END_SESSION" }).connectedUserIds).toEqual([
      "user-1",
    ]);
  });
});

describe("RESET", () => {
  it("returns to the initial state, presence included", () => {
    const live = reduce(
      initialLiveSessionState,
      { type: "START_SESSION", session },
      { type: "SESSION_JOINED" },
      { type: "REPLACE_PRESENCE", userIds: ["user-1"] },
    );

    expect(liveSessionReducer(live, { type: "RESET" })).toEqual(initialLiveSessionState);
  });
});

describe("REPLACE_PRESENCE", () => {
  it("replaces rather than merges the connected set", () => {
    const next = reduce(
      initialLiveSessionState,
      { type: "REPLACE_PRESENCE", userIds: ["user-1", "user-2"] },
      { type: "REPLACE_PRESENCE", userIds: ["user-3"] },
    );

    expect(next.connectedUserIds).toEqual(["user-3"]);
  });
});

describe("ROLL_LOGGED", () => {
  it("puts the newest roll at the head of the feed", () => {
    const next = reduce(
      initialLiveSessionState,
      { type: "ROLL_LOGGED", roll: roll("older") },
      { type: "ROLL_LOGGED", roll: roll("newer") },
    );

    expect(next.rolls.map((entry) => entry.id)).toEqual(["newer", "older"]);
  });

  it("drops the oldest roll once the window is full", () => {
    const actions: LiveSessionAction[] = Array.from(
      { length: ROLL_LIMIT + 1 },
      (_, i) => ({ type: "ROLL_LOGGED", roll: roll(`r${i}`) }),
    );

    const next = reduce(initialLiveSessionState, ...actions);

    expect(next.rolls).toHaveLength(ROLL_LIMIT);
    expect(next.rolls.at(-1)?.id).toBe("r1");
  });
});

describe("TURN_ADVANCED", () => {
  it("names the participant whose turn it is", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "TURN_ADVANCED",
      participantName: "Goblin Boss",
      rechargeRolls: [],
    });

    expect(next.events[0]).toMatchObject({
      kind: "turn_advanced",
      message: "Turn: Goblin Boss",
    });
  });

  it("falls back to a generic message when the participant is unknown", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "TURN_ADVANCED",
      participantName: null,
      rechargeRolls: [],
    });

    expect(next.events[0].message).toBe("Turn advanced");
  });

  it("logs a successful recharge after the turn event", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "TURN_ADVANCED",
      participantName: "Ancient Dragon",
      rechargeRolls: [
        {
          abilityId: "breath",
          abilityName: "Fire Breath",
          roll: 6,
          threshold: 5,
          charged: true,
        },
      ],
    });

    expect(next.events[0]).toMatchObject({
      kind: "dice_rolled",
      message: "Fire Breath: recharge 6 (5+) — recharged",
      actorName: "Ancient Dragon",
    });
    expect(next.events[1].kind).toBe("turn_advanced");
  });

  it("logs a failed recharge distinctly", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "TURN_ADVANCED",
      participantName: "Ancient Dragon",
      rechargeRolls: [
        {
          abilityId: "breath",
          abilityName: "Fire Breath",
          roll: 2,
          threshold: 5,
          charged: false,
        },
      ],
    });

    expect(next.events[0].message).toBe("Fire Breath: recharge 2 (5+) — still spent");
  });
});

describe("INITIATIVE_ROLLED", () => {
  it("logs one event per roll, newest first", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "INITIATIVE_ROLLED",
      rolls: [
        { participantId: "p1", participantName: "Mira", roll: 12, modifier: 3, total: 15 },
        { participantId: "p2", participantName: "Goblin", roll: 8, modifier: 2, total: 10 },
      ],
    });

    expect(next.events.map((event) => event.message)).toEqual([
      "Goblin: initiative 10 (8+2)",
      "Mira: initiative 15 (12+3)",
    ]);
  });

  it("renders a negative modifier without doubling the sign", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "INITIATIVE_ROLLED",
      rolls: [
        { participantId: "p1", participantName: "Zombie", roll: 9, modifier: -2, total: 7 },
      ],
    });

    expect(next.events[0].message).toBe("Zombie: initiative 7 (9-2)");
  });

  it("renders a zero modifier as a plus", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "INITIATIVE_ROLLED",
      rolls: [
        { participantId: "p1", participantName: "Ooze", roll: 9, modifier: 0, total: 9 },
      ],
    });

    expect(next.events[0].message).toBe("Ooze: initiative 9 (9+0)");
  });

  it("leaves the event feed untouched when nothing was rolled", () => {
    const next = liveSessionReducer(initialLiveSessionState, {
      type: "INITIATIVE_ROLLED",
      rolls: [],
    });

    expect(next.events).toEqual([]);
  });
});

describe("event feed retention", () => {
  it("keeps only the newest events once the window is full", () => {
    const actions: LiveSessionAction[] = Array.from(
      { length: EVENT_LIMIT + 5 },
      (_, i) => ({
        type: "ATTENDANCE_CHANGED",
        displayName: `Player ${i}`,
        action: "joined",
      }),
    );

    const next = reduce(initialLiveSessionState, ...actions);

    expect(next.events).toHaveLength(EVENT_LIMIT);
    expect(next.events[0].message).toBe(`Player ${EVENT_LIMIT + 4} joined the session`);
  });

  it("applies the limit within a single turn that logs many recharges", () => {
    const rechargeRolls = Array.from({ length: EVENT_LIMIT + 5 }, (_, i) => ({
      abilityId: `a${i}`,
      abilityName: `Ability ${i}`,
      roll: 6,
      threshold: 5,
      charged: true,
    }));

    const next = liveSessionReducer(initialLiveSessionState, {
      type: "TURN_ADVANCED",
      participantName: "Tarrasque",
      rechargeRolls,
    });

    expect(next.events).toHaveLength(EVENT_LIMIT);
  });
});

describe("purity", () => {
  it("never mutates the state it was given", () => {
    const before = reduce(
      initialLiveSessionState,
      { type: "START_SESSION", session },
      { type: "ROLL_LOGGED", roll: roll("r1") },
    );
    const snapshot = structuredClone(before);

    liveSessionReducer(before, { type: "ROLL_LOGGED", roll: roll("r2") });
    liveSessionReducer(before, { type: "END_SESSION" });

    expect(before).toEqual(snapshot);
  });
});
