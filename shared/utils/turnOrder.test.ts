import { describe, expect, it } from "vitest";
import { nextTurn, turnAfterRemoval } from "./turnOrder.js";

const participants = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
];

describe("nextTurn", () => {
  it("returns no participant for an empty encounter", () => {
    expect(nextTurn([], "a")).toEqual({ participant: null, wrapped: false });
  });

  it("starts at the first participant when no turn is set", () => {
    expect(nextTurn(participants, null)).toEqual({
      participant: { id: "a" },
      wrapped: false,
    });
  });

  it("starts at the first participant when the current id is unknown", () => {
    expect(nextTurn(participants, "ghost")).toEqual({
      participant: { id: "a" },
      wrapped: false,
    });
  });

  it("advances to the following participant", () => {
    expect(nextTurn(participants, "a")).toEqual({
      participant: { id: "b" },
      wrapped: false,
    });
  });

  it("wraps to the first participant after the last one", () => {
    expect(nextTurn(participants, "c")).toEqual({
      participant: { id: "a" },
      wrapped: true,
    });
  });

  it("reports a wrap for a single-participant encounter", () => {
    expect(nextTurn([{ id: "a" }], "a")).toEqual({
      participant: { id: "a" },
      wrapped: true,
    });
  });
});

describe("turnAfterRemoval", () => {
  it("keeps the current participant when someone else is removed", () => {
    expect(turnAfterRemoval(participants, "b", ["c"])).toEqual({
      participant: { id: "b" },
      wrapped: false,
    });
  });

  it("passes the turn to the next survivor when the active participant is removed", () => {
    expect(turnAfterRemoval(participants, "a", ["a"])).toEqual({
      participant: { id: "b" },
      wrapped: false,
    });
  });

  it("skips over participants removed in the same batch", () => {
    expect(turnAfterRemoval(participants, "a", ["a", "b"])).toEqual({
      participant: { id: "c" },
      wrapped: false,
    });
  });

  it("wraps to an earlier survivor when the removed participant was last", () => {
    expect(turnAfterRemoval(participants, "c", ["c"])).toEqual({
      participant: { id: "a" },
      wrapped: true,
    });
  });

  it("returns no participant when every participant is removed", () => {
    expect(turnAfterRemoval(participants, "a", ["a", "b", "c"])).toEqual({
      participant: null,
      wrapped: false,
    });
  });

  it("returns no participant when there is no active turn", () => {
    expect(turnAfterRemoval(participants, null, ["a"])).toEqual({
      participant: null,
      wrapped: false,
    });
  });
});
