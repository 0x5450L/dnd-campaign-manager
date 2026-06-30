export type DiceRollMode = "normal" | "advantage" | "disadvantage";

export type DiceRollDTO = {
  id: string;
  createdAt: string;
  campaignSessionId: string;
  userId: string;
  characterId: string | null;
  formula: string;
  mode: DiceRollMode;
  resultByDie: any;
  total: number;
};
