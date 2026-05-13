export const DICE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"] as const;
export type DiceType = (typeof DICE_TYPES)[number];

export type AdvDis = "normal" | "advantage" | "disadvantage";

export type KeepKind = "kh" | "kl";

export type DiceTerm =
  | {
      kind: "dice";
      count: number;
      sides: number;
      keep?: { kind: KeepKind; n: number };
      sign: 1 | -1;
    }
  | {
      kind: "modifier";
      value: number;
    };

export type DieRoll = {
  sides: number;
  value: number;
  dropped: boolean;
};

export type RolledTerm =
  | {
      kind: "dice";
      sides: number;
      sign: 1 | -1;
      rolls: DieRoll[];
      subtotal: number;
      keep?: { kind: KeepKind; n: number };
    }
  | {
      kind: "modifier";
      value: number;
    };

export type RollResult = {
  expression: string;
  label?: string;
  terms: RolledTerm[];
  total: number;
  critSuccess: boolean;
  critFail: boolean;
  timestamp: number;
  id: string;
};

export type DiceHistoryEntry = RollResult;
