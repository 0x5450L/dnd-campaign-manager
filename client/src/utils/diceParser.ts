import type {
  AdvDis,
  DiceTerm,
  DiceType,
  DieRoll,
  RollResult,
  RolledTerm,
} from "../types/dice";
import { rollDie } from "../../../shared/utils/dice";

const SUPPORTED_SIDES = new Set([4, 6, 8, 10, 12, 20, 100]);
const DICE_TOKEN = /^(\d*)d(\d+)(?:(kh|kl)(\d+))?$/i;
const NUMBER_TOKEN = /^\d+$/;

export class DiceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiceParseError";
  }
}

export const parseDiceFormula = (raw: string): DiceTerm[] => {
  const cleaned = raw.replace(/\s+/g, "").toLowerCase();
  if (!cleaned) throw new DiceParseError("Empty formula");

  const tokens: { sign: 1 | -1; body: string }[] = [];
  let i = 0;
  let currentSign: 1 | -1 = 1;
  let buffer = "";

  if (cleaned[0] === "+" || cleaned[0] === "-") {
    currentSign = cleaned[0] === "-" ? -1 : 1;
    i = 1;
  }

  while (i < cleaned.length) {
    const ch = cleaned[i];
    if (ch === "+" || ch === "-") {
      if (!buffer) throw new DiceParseError(`Double sign at position ${i}`);
      tokens.push({ sign: currentSign, body: buffer });
      buffer = "";
      currentSign = ch === "-" ? -1 : 1;
    } else {
      buffer += ch;
    }
    i++;
  }
  if (buffer) tokens.push({ sign: currentSign, body: buffer });
  if (tokens.length === 0) throw new DiceParseError("Cannot parse formula");

  return tokens.map(({ sign, body }) => {
    if (NUMBER_TOKEN.test(body)) {
      return { kind: "modifier", value: sign * Number(body) };
    }

    const m = body.match(DICE_TOKEN);
    if (!m) throw new DiceParseError(`Unknown token: "${body}"`);

    const count = m[1] === "" ? 1 : Number(m[1]);
    const sides = Number(m[2]);
    const keepKind = m[3] as "kh" | "kl" | undefined;
    const keepN = m[4] ? Number(m[4]) : undefined;

    if (count < 1 || count > 100) {
      throw new DiceParseError(`Dice count must be 1..100 (got ${count})`);
    }
    if (!SUPPORTED_SIDES.has(sides)) {
      throw new DiceParseError(`Die d${sides} is not supported`);
    }
    if (keepKind && keepN !== undefined && (keepN < 1 || keepN > count)) {
      throw new DiceParseError(
        `kh/kl must be in range 1..${count} (got ${keepN})`,
      );
    }

    return {
      kind: "dice",
      count,
      sides,
      sign,
      keep:
        keepKind && keepN !== undefined ? { kind: keepKind, n: keepN } : undefined,
    };
  });
};

export const applyAdvDis = (terms: DiceTerm[], mode: AdvDis): DiceTerm[] => {
  if (mode === "normal") return terms;
  return terms.map((t) => {
    if (t.kind !== "dice") return t;
    if (t.sides !== 20) return t;
    if (t.count !== 1) return t;
    if (t.keep) return t;
    return {
      ...t,
      count: 2,
      keep: { kind: mode === "advantage" ? "kh" : "kl", n: 1 },
    };
  });
};

export const rollTerms = (
  terms: DiceTerm[],
  expression: string,
  label?: string,
): RollResult => {
  const rolled: RolledTerm[] = [];
  let total = 0;
  let critSuccess = false;
  let critFail = false;

  for (const term of terms) {
    if (term.kind === "modifier") {
      total += term.value;
      rolled.push({ kind: "modifier", value: term.value });
      continue;
    }

    const raw: DieRoll[] = [];
    for (let i = 0; i < term.count; i++) {
      raw.push({ sides: term.sides, value: rollDie(term.sides), dropped: false });
    }

    let kept = raw;
    if (term.keep) {
      const sorted = [...raw].sort((a, b) => b.value - a.value);
      const keepSet = new Set<DieRoll>();
      if (term.keep.kind === "kh") {
        for (let i = 0; i < term.keep.n; i++) keepSet.add(sorted[i]);
      } else {
        for (let i = sorted.length - 1; i >= sorted.length - term.keep.n; i--) {
          keepSet.add(sorted[i]);
        }
      }
      kept = raw.map((r) => ({ ...r, dropped: !keepSet.has(r) }));
    }

    const subtotalAbs = kept
      .filter((r) => !r.dropped)
      .reduce((acc, r) => acc + r.value, 0);
    const subtotal = subtotalAbs * term.sign;

    if (term.sides === 20) {
      for (const r of kept) {
        if (r.dropped) continue;
        if (r.value === 20) critSuccess = true;
        if (r.value === 1) critFail = true;
      }
    }

    rolled.push({
      kind: "dice",
      sides: term.sides,
      sign: term.sign,
      rolls: kept,
      subtotal,
      keep: term.keep,
    });
    total += subtotal;
  }

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    expression,
    label,
    terms: rolled,
    total,
    critSuccess,
    critFail,
  };
};

export const formatTerms = (terms: DiceTerm[]): string => {
  if (terms.length === 0) return "";
  const parts: string[] = [];
  terms.forEach((t, idx) => {
    if (t.kind === "modifier") {
      const sign = t.value >= 0 ? "+" : "-";
      const abs = Math.abs(t.value);
      if (idx === 0) parts.push(t.value < 0 ? `-${abs}` : `${abs}`);
      else parts.push(`${sign} ${abs}`);
      return;
    }
    const keepStr = t.keep ? `${t.keep.kind}${t.keep.n}` : "";
    const body = `${t.count}d${t.sides}${keepStr}`;
    if (idx === 0) parts.push(t.sign === -1 ? `-${body}` : body);
    else parts.push(`${t.sign === -1 ? "-" : "+"} ${body}`);
  });
  return parts.join(" ");
};

export const addDieToFormula = (current: string, type: DiceType): string => {
  const sides = Number(type.slice(1));
  let terms: DiceTerm[];
  try {
    terms = current.trim() ? parseDiceFormula(current) : [];
  } catch {
    terms = [];
  }

  const idx = terms.findIndex(
    (t) => t.kind === "dice" && t.sign === 1 && t.sides === sides && !t.keep,
  );

  if (idx >= 0) {
    const t = terms[idx];
    if (t.kind === "dice") {
      terms[idx] = { ...t, count: Math.min(100, t.count + 1) };
    }
  } else {
    terms.push({ kind: "dice", count: 1, sides, sign: 1 });
  }

  return formatTerms(terms);
};
