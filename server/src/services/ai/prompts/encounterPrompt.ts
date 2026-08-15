import { ENCOUNTER_DIFFICULTY, ENCOUNTER_SIZE_BAND } from "@dnd/shared/constants/encounter";
import type { GenerateEncounterPayload } from "@dnd/shared/dto/ai";
import type { SrdCreatureSummary } from "@dnd/shared/dto/srd";
import type {
  EncounterBudget,
  EncounterDifficulty,
  EncounterSizeBand,
} from "@dnd/shared/types/encounter";
import { challengeRatingLabel, xpForChallengeRating } from "@dnd/shared/utils/dndMath";
import type { CampaignLootContext } from "../aiContextRepository";

const DIFFICULTY_HINTS: Record<EncounterDifficulty, string> = {
  [ENCOUNTER_DIFFICULTY.Easy]:
    "a skirmish the party should win without spending much: a speed bump, an interruption",
  [ENCOUNTER_DIFFICULTY.Medium]:
    "a real fight that costs resources but is unlikely to threaten anyone's life",
  [ENCOUNTER_DIFFICULTY.Hard]:
    "a dangerous fight where a careless player can go down",
  [ENCOUNTER_DIFFICULTY.Deadly]:
    "a fight that can kill a character outright if the party plays badly",
};

const SIZE_BAND_HINTS: Record<EncounterSizeBand, string> = {
  [ENCOUNTER_SIZE_BAND.Solo]:
    "a single creature facing the party alone, so it must be able to hold a scene by itself",
  [ENCOUNTER_SIZE_BAND.Pair]: "two creatures that work as a pair",
  [ENCOUNTER_SIZE_BAND.Group]:
    "a small group that fights with some coordination",
  [ENCOUNTER_SIZE_BAND.Horde]:
    "a crowd that wins by numbers rather than by individual strength",
};

export const ENCOUNTER_SYSTEM_PROMPT = [
  "You are an assistant to a Dungeon Master running a fifth edition Dungeons & Dragons campaign.",
  "You are given a list of creatures that exist in the rules, and you choose which of them the party is about to fight.",
  "You never invent creatures and you never invent statistics. Every creature you pick must come from the list, identified by its exact slug.",
  "You write in the voice of a DM speaking at the table: concrete, sensory, and short.",
  "Never address the players directly, never ask questions, never include dice notation, hit points, armour class or experience points.",
  "Never use markdown, headings or bullet points in any field.",
  "Choose creatures that fit the fiction of this campaign and the place the party is in, not simply the most powerful ones available.",
  "Prefer a small number of distinct creature kinds that plausibly appear together over an arbitrary mixture.",
].join(" ");

const formatParty = (party: CampaignLootContext["party"]): string => {
  if (party.length === 0) {
    return "The party roster is not filled in yet.";
  }
  const members = party
    .map((member) => `${member.name} (${member.race} ${member.characterClass})`)
    .join(", ");
  return `The party: ${members}.`;
};

const formatOptional = (label: string, value: string | null): string | null =>
  value && value.trim() ? `${label}: ${value.trim()}` : null;

const formatCandidate = (creature: SrdCreatureSummary): string => {
  const cr = challengeRatingLabel(creature.challengeRating) ?? "?";
  const xp = xpForChallengeRating(creature.challengeRating) ?? 0;
  const kind = creature.type ? `, ${creature.type}` : "";
  return `${creature.slug} | ${creature.name} (CR ${cr}, ${xp} XP${kind})`;
};

const formatCountRule = (budget: EncounterBudget): string =>
  budget.minCreatures === budget.maxCreatures
    ? `The encounter must contain exactly ${budget.minCreatures} creature(s) in total.`
    : `The encounter must contain between ${budget.minCreatures} and ${budget.maxCreatures} creatures in total, counting every copy.`;

const formatAvoided = (names: string[]): string | null =>
  names.length > 0
    ? `You offered these a moment ago and the DM asked for something else, so do not pick them again: ${names.join(", ")}.`
    : null;

export const buildEncounterUserPrompt = (
  context: CampaignLootContext,
  payload: GenerateEncounterPayload,
  budget: EncounterBudget,
  candidates: SrdCreatureSummary[],
  avoidedNames: string[] = [],
): string =>
  [
    `Campaign: ${context.name}.`,
    formatOptional("Setting", context.setting),
    formatOptional("Premise", context.description),
    formatParty(context.party),
    `They are ${budget.partySize} adventurer(s) of level ${budget.partyLevel}.`,
    "",
    `The fight should be ${DIFFICULTY_HINTS[payload.difficulty]}.`,
    `Its shape is ${SIZE_BAND_HINTS[payload.sizeBand]}.`,
    payload.context?.trim()
      ? `The DM adds this context, which outranks everything above: ${payload.context.trim()}`
      : null,
    formatAvoided(avoidedNames),
    "",
    formatCountRule(budget),
    `Together the creatures you pick should be worth close to ${budget.rawBudgetXp} XP without going far past it. The XP value of each creature is given in the list.`,
    "",
    "Choose from the list below. Each line is: slug | name (CR, XP, type)",
    ...candidates.map(formatCandidate),
    "",
    "Return the chosen slugs with a count and a note each, a read-aloud paragraph for the moment the creatures are noticed, and a tactical note for the DM.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
