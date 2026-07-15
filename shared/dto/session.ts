import type { CharacterAttackDTO, CharacterAttackInput } from "./character";
import type { AbilityName, SpellSlotLevel } from "../types/dnd";
import type { Ability, AbilityUsageAction, ResourcePool } from "../types/abilities";

export type { SpellSlotLevel };

export type SessionStatus = "active" | "paused" | "ended";

export type EncounterStatus = "setup" | "active" | "ended";

export type ParticipantType = "pc" | "npc" | "monster";

export type CampaignSessionDTO = {
  id: string;
  number: number;
  status: SessionStatus;
  title: string | null;
  summary: string | null;
  notes: string | null;
  campaignId: string;
  startedAt: string;
  updatedAt: string;
  endedAt: string | null;
};

export type SessionDiceRollDTO = {
  id: string;
  actorName: string;
  expression: string;
  total: number;
  critSuccess: boolean;
  critFail: boolean;
  at: string;
};

export type EncounterDTO = {
  id: string;
  name: string | null;
  status: EncounterStatus;
  round: number;
  currentTurnIndex: number;
  campaignSessionId: string;
  startedAt: string;
  updatedAt: string;
  endedAt: string | null;
};

export type ParticipantAbilityScore = {
  name: AbilityName;
  score: number;
};

export type { Ability, AbilityActivation, AbilityCost, AbilityUsageAction, ResourcePool, ResourceReset } from "../types/abilities";

export type EncounterParticipantDTO = {
  id: string;
  encounterId: string;
  characterId: string | null;
  type: ParticipantType;
  name: string;
  sortOrder: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  attacks: CharacterAttackDTO[];
  conditions: string[];
  isVisible: boolean;
  acHidden: boolean;
  typeHidden: boolean;
  usesShield: boolean;
  abilityScores: ParticipantAbilityScore[] | null;
  spellAbility: AbilityName | null;
  proficiencyBonus: number | null;
  spellSlots?: SpellSlotLevel[] | null;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  speed: string | null;
  senses: string | null;
  challengeRating: number | null;
  damageVulnerabilities: string | null;
  damageResistances: string | null;
  damageImmunities: string | null;
  conditionImmunities: string | null;
  abilities: Ability[] | null;
  resources: ResourcePool[] | null;
  createdAt: string;
  updatedAt: string;
};

export type EncounterWithParticipantsDTO = EncounterDTO & {
  participants: EncounterParticipantDTO[];
};

export type CreateSessionPayload = {
  campaignId: string;
  title?: string;
};

export type UpdateSessionPayload = Partial<{
  status: SessionStatus;
  title: string;
  summary: string;
  notes: string;
}>;

export type CreateEncounterPayload = {
  name?: string;
};

export type UpdateEncounterPayload = Partial<{
  status: EncounterStatus;
  name: string;
}>;

export type CreateParticipantPayload = {
  type: ParticipantType;
  name: string;
  characterId?: string | null;
  sortOrder: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  tempHp?: number;
  conditions?: string[];
  isVisible?: boolean;
  acHidden?: boolean;
  typeHidden?: boolean;
  usesShield?: boolean;
  abilityScores?: ParticipantAbilityScore[] | null;
  spellAbility?: AbilityName | null;
  proficiencyBonus?: number | null;
  spellSlots?: SpellSlotLevel[] | null;
  attacks?: CharacterAttackInput[];
  speed?: string | null;
  senses?: string | null;
  challengeRating?: number | null;
  damageVulnerabilities?: string | null;
  damageResistances?: string | null;
  damageImmunities?: string | null;
  conditionImmunities?: string | null;
  abilities?: Ability[] | null;
  resources?: ResourcePool[] | null;
};

export type UpdateParticipantPayload = Partial<{
  name: string;
  sortOrder: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  attacks: CharacterAttackInput[];
  conditions: string[];
  isVisible: boolean;
  acHidden: boolean;
  typeHidden: boolean;
  usesShield: boolean;
  abilityScores: ParticipantAbilityScore[] | null;
  spellAbility: AbilityName | null;
  proficiencyBonus: number | null;
  spellSlots: SpellSlotLevel[] | null;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  speed: string | null;
  senses: string | null;
  challengeRating: number | null;
  damageVulnerabilities: string | null;
  damageResistances: string | null;
  damageImmunities: string | null;
  conditionImmunities: string | null;
  abilities: Ability[] | null;
  resources: ResourcePool[] | null;
}>;

export type BulkInitiativeEntry = {
  participantId: string;
  sortOrder: number;
};

export type InitiativeRollDTO = {
  participantId: string;
  participantName: string;
  roll: number;
  modifier: number;
  total: number;
};

export type RollInitiativePayload = {
  participantIds?: string[];
};

export type AbilityUsagePayload = {
  action: AbilityUsageAction;
};

export type BulkInitiativePayload = {
  entries: BulkInitiativeEntry[];
};

export type BulkCreateParticipantsPayload = {
  participants: CreateParticipantPayload[];
};
