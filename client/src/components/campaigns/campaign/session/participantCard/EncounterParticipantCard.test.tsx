import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EncounterParticipantDTO } from "@/types/encounter";
import { EncounterParticipantCard } from "./EncounterParticipantCard";

vi.mock("@/hooks/liveSession/useParticipantActions", () => ({
  useParticipantActions: () => ({
    adjustHp: vi.fn(),
    grantTempHp: vi.fn(),
    toggleCondition: vi.fn(),
    setVisibility: vi.fn(),
    setAcHidden: vi.fn(),
    setShield: vi.fn(),
    recordDeathSave: vi.fn(),
    resetDeathSaves: vi.fn(),
    updateParticipant: vi.fn(),
    rollInitiative: vi.fn(),
    applyAbilityUsage: vi.fn(),
    applySpellSlotUsage: vi.fn(),
    addParticipant: vi.fn(),
    removeParticipant: vi.fn(),
  }),
}));

const participant = (
  overrides: Partial<EncounterParticipantDTO> = {},
): EncounterParticipantDTO => ({
  id: "participant-1",
  encounterId: "encounter-1",
  characterId: null,
  type: "monster",
  name: "Goblin Ambusher",
  sortOrder: 0,
  maxHp: 12,
  currentHp: 12,
  tempHp: 0,
  armorClass: 15,
  attacks: [],
  conditions: [],
  isVisible: true,
  acHidden: false,
  typeHidden: false,
  usesShield: false,
  abilityScores: null,
  spellAbility: null,
  proficiencyBonus: null,
  spellSlots: null,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  speed: null,
  senses: null,
  challengeRating: 1,
  damageVulnerabilities: null,
  damageResistances: null,
  damageImmunities: null,
  conditionImmunities: null,
  abilities: null,
  resources: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const renderCard = (
  props: { isDM: boolean; isOwner?: boolean; participant?: EncounterParticipantDTO },
) =>
  render(
    <EncounterParticipantCard
      participant={props.participant ?? participant()}
      isActive={false}
      isDM={props.isDM}
      isOwner={props.isOwner ?? false}
    />,
  );

describe("a participant the DM has hidden", () => {
  const hidden = participant({ isVisible: false });

  it("does not reach the player at all", () => {
    renderCard({ isDM: false, participant: hidden });

    expect(screen.queryByText("Goblin Ambusher")).not.toBeInTheDocument();
  });

  it("is still on the DM's screen, because it still takes its turn", () => {
    renderCard({ isDM: true, participant: hidden });

    expect(screen.getByText("Goblin Ambusher")).toBeInTheDocument();
  });
});

describe("the control that hides a participant", () => {
  it("is offered to the DM", () => {
    renderCard({ isDM: true });

    expect(
      screen.getByRole("button", { name: "Hide from players" }),
    ).toBeInTheDocument();
  });

  it("is not offered to a player", () => {
    renderCard({ isDM: false });

    expect(
      screen.queryByRole("button", { name: /hide from players|reveal to players/i }),
    ).not.toBeInTheDocument();
  });

  it("is not offered to a player who owns the participant either", () => {
    const own = participant({ type: "pc", characterId: "character-1", name: "Mira" });
    renderCard({ isDM: false, isOwner: true, participant: own });

    expect(
      screen.queryByRole("button", { name: /hide from players|reveal to players/i }),
    ).not.toBeInTheDocument();
  });

  it("says it will reveal rather than hide once the participant is already hidden", () => {
    renderCard({ isDM: true, participant: participant({ isVisible: false }) });

    expect(
      screen.getByRole("button", { name: "Reveal to players" }),
    ).toBeInTheDocument();
  });
});

describe("the control that removes a participant", () => {
  it("is offered to the DM", () => {
    renderCard({ isDM: true });

    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  it("is not offered to a player who owns the participant", () => {
    const own = participant({ type: "pc", characterId: "character-1", name: "Mira" });
    renderCard({ isDM: false, isOwner: true, participant: own });

    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });
});
