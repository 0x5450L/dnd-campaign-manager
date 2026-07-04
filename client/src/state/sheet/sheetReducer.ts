import type { SheetState } from "../../types/characters/characterSheet";
import {
  applySharedAction,
  isSharedSheetAction,
  type SharedSheetAction,
} from "./sharedReducerFunction";
import {
  applyCharacterAction,
  isCharacterSheetAction,
  type CharacterSheetAction,
} from "./characterReducerFunction";
import {
  applyCreatureAction,
  isCreatureSheetAction,
  type CreatureSheetAction,
} from "./creatureReducerFunction";

export type SheetAction =
  | SharedSheetAction
  | CharacterSheetAction
  | CreatureSheetAction;

export const sheetReducer = (
  state: SheetState,
  action: SheetAction,
): SheetState => {
  if (isSharedSheetAction(action)) {
    return applySharedAction(state, action);
  }
  if (isCharacterSheetAction(action)) {
    return state.kind === "character"
      ? applyCharacterAction(state, action)
      : state;
  }
  if (isCreatureSheetAction(action)) {
    return state.kind === "creature"
      ? applyCreatureAction(state, action)
      : state;
  }
  return state;
};
