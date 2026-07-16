import { useShallow } from "zustand/react/shallow";
import { useSheetStore, type SheetActions } from "./sheetStore";
import type {
  CharacterSheetState,
  CreatureSheetState,
  SheetState,
} from "@/types/characters/characterSheet";

export const useSheetActions = (): SheetActions =>
  useSheetStore((store) => store.actions);

export const useActiveSheetId = (): string | null =>
  useSheetStore((store) => store.sheetId);

export const useSheet = <T>(selector: (state: SheetState) => T): T =>
  useSheetStore(useShallow((store) => selector(store.state)));

const assertCharacter = (state: SheetState): CharacterSheetState => {
  if (state.kind !== "character") {
    throw new Error("Character sheet hook used inside a creature sheet");
  }
  return state;
};

const assertCreature = (state: SheetState): CreatureSheetState => {
  if (state.kind !== "creature") {
    throw new Error("Creature sheet hook used inside a character sheet");
  }
  return state;
};

export const useCharacterSheet = <T>(
  selector: (state: CharacterSheetState) => T,
): T => useSheetStore(useShallow((store) => selector(assertCharacter(store.state))));

export const useCreatureSheet = <T>(
  selector: (state: CreatureSheetState) => T,
): T => useSheetStore(useShallow((store) => selector(assertCreature(store.state))));

export const useCharacterSheetState = (): CharacterSheetState =>
  useSheetStore((store) => assertCharacter(store.state));

export const useCreatureSheetState = (): CreatureSheetState =>
  useSheetStore((store) => assertCreature(store.state));
