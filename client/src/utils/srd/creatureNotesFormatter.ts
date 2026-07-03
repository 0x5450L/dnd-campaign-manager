import type { SrdCreature } from "../../../../shared/dto/srd";

export const buildNotes = (creature: SrdCreature): string =>
  creature.alignment && creature.alignment.trim() !== ""
    ? `Alignment: ${creature.alignment}`
    : "";
