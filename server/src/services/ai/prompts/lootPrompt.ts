import { LOOT_FIND_TYPE, LOOT_RICHNESS } from "@dnd/shared/constants/ai";
import type {
  GenerateLootPayload,
  LootFindType,
  LootRichness,
} from "@dnd/shared/dto/ai";
import type { SrdItemSummary } from "@dnd/shared/dto/srd";
import type { CampaignLootContext } from "../aiContextRepository";

const FIND_TYPE_HINTS: Record<LootFindType, string> = {
  [LOOT_FIND_TYPE.Hoard]:
    "a deliberate hoard: a chest, vault or dragon's pile, gathered by someone over time",
  [LOOT_FIND_TYPE.Body]:
    "what is carried by a fallen creature: personal, worn, sometimes sentimental",
  [LOOT_FIND_TYPE.Stash]:
    "a hidden cache: stashed in a hurry, concealed, meant to be retrieved later",
  [LOOT_FIND_TYPE.Reward]:
    "a reward handed over by an NPC: presentable, given with intent, tied to an obligation",
};

const RICHNESS_HINTS: Record<LootRichness, string> = {
  [LOOT_RICHNESS.Meager]: "meagre: everyday things, nothing a merchant would envy",
  [LOOT_RICHNESS.Modest]: "modest: useful, worth carrying, one piece worth talking about",
  [LOOT_RICHNESS.Generous]: "generous: a memorable haul worth a scene of its own",
};

export const LOOT_SYSTEM_PROMPT = [
  "You are an assistant to a Dungeon Master running a fifth edition Dungeons & Dragons campaign.",
  "You are given a list of items that exist in the rules, and you choose which of them the party has just found.",
  "You never invent items. Every item you pick must come from the list, identified by its exact slug.",
  "You write in the voice of a DM speaking at the table: concrete, sensory, and short.",
  "Never address the players directly, never ask questions, never include game statistics, prices or dice notation.",
  "Never use markdown, headings or bullet points in any field.",
  "Choose items that fit the fiction of this campaign and the situation described, not simply the most powerful ones.",
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

const formatCandidate = (item: SrdItemSummary): string => {
  const details = [item.itemType, item.rarity ?? "mundane"]
    .filter((detail): detail is string => !!detail)
    .join(", ");
  return `${item.slug} | ${item.name}${details ? ` (${details})` : ""}`;
};

const formatAvoided = (names: string[]): string | null =>
  names.length > 0
    ? `You offered these a moment ago and the DM asked for something else, so do not pick them again: ${names.join(", ")}.`
    : null;

export const buildLootUserPrompt = (
  context: CampaignLootContext,
  payload: GenerateLootPayload,
  candidates: SrdItemSummary[],
  avoidedNames: string[] = [],
): string =>
  [
    `Campaign: ${context.name}.`,
    formatOptional("Setting", context.setting),
    formatOptional("Premise", context.description),
    formatParty(context.party),
    "",
    `The find is ${FIND_TYPE_HINTS[payload.findType]}.`,
    `Overall value is ${RICHNESS_HINTS[payload.richness]}.`,
    payload.context?.trim()
      ? `The DM adds this context, which outranks everything above: ${payload.context.trim()}`
      : null,
    formatAvoided(avoidedNames),
    "",
    `Choose exactly ${payload.itemCount} item(s) from the list below. Do not repeat an item.`,
    "Each line is: slug | name (type, rarity)",
    ...candidates.map(formatCandidate),
    "",
    "Return the chosen slugs with a note each, and a read-aloud paragraph that mentions the items as objects in the scene without naming their rarities.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
