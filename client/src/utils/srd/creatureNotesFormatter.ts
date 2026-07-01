import type { SrdCreature, SrdCreatureAction } from "../../../../shared/dto/srd";

const labelled = (title: string, body: string | null): string | null =>
  body && body.trim() !== "" ? `${title}: ${body}` : null;

const actionsBlock = (
  title: string,
  actions: SrdCreatureAction[],
): string | null => {
  if (actions.length === 0) {
    return null;
  }
  const lines = actions.map((a) => `• ${a.name}: ${a.description}`).join("\n");
  return `${title}\n${lines}`;
};

export const buildNotes = (creature: SrdCreature): string => {
  const descriptor =
    [creature.size, creature.type, creature.alignment]
      .filter(Boolean)
      .join(", ") || null;
  const parts = [
    labelled("Type", descriptor),
    labelled("Challenge rating", String(creature.challengeRating)),
    labelled("Senses", creature.senses),
    labelled("Languages", creature.languages),
    labelled("Damage immunities", creature.damageImmunities),
    labelled("Damage resistances", creature.damageResistances),
    labelled("Damage vulnerabilities", creature.damageVulnerabilities),
    labelled("Condition immunities", creature.conditionImmunities),
    actionsBlock("Traits", creature.specialAbilities),
    actionsBlock("Legendary actions", creature.legendaryActions),
  ];
  return parts.filter((part): part is string => part !== null).join("\n\n");
};
