import type {
  CreatureSheetFields,
  CreatureSheetState,
} from "../../types/characters/characterSheet";

export type CreatureSheetAction = {
  type: "SET_CREATURE_FIELD";
  payload: Partial<CreatureSheetFields>;
};

const CREATURE_ACTION_TYPES: ReadonlySet<string> = new Set<
  CreatureSheetAction["type"]
>(["SET_CREATURE_FIELD"]);

export const isCreatureSheetAction = (action: {
  type: string;
}): action is CreatureSheetAction => CREATURE_ACTION_TYPES.has(action.type);

export const applyCreatureAction = (
  state: CreatureSheetState,
  action: CreatureSheetAction,
): CreatureSheetState => {
  switch (action.type) {
    case "SET_CREATURE_FIELD":
      return { ...state, ...action.payload };
  }
};
