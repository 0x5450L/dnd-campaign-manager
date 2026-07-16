import { useEffect, useState } from "react";
import type { DiceType, RollResult, RolledTerm } from "@/types/dice";
import DiceShape from "./DiceShape";

type Props = {
  result: RollResult | null;
  isRolling: boolean;
  error: string | null;
};

export const DiceResult = ({ result, isRolling, error }: Props) => {
  const [tumblingTotal, setTumblingTotal] = useState<number>(0);

  useEffect(() => {
    if (!isRolling) return;
    const id = window.setInterval(() => {
      setTumblingTotal(Math.floor(Math.random() * 30));
    }, 60);
    return () => window.clearInterval(id);
  }, [isRolling]);

  const borderClass = (() => {
    if (isRolling || !result) return "border-rule";
    if (result.critSuccess) return "border-leaf shadow-[0_0_18px_rgba(93,165,93,0.25)]";
    if (result.critFail) return "border-rust shadow-[0_0_18px_rgba(201,85,85,0.25)]";
    return "border-rule";
  })();

  if (error) {
    return (
      <div className="min-h-[110px] rounded-lg border border-rust bg-bg/70 px-4 py-3 text-sm text-rust">
        ⚠ {error}
      </div>
    );
  }

  const modifierTotal = result
    ? result.terms.reduce(
        (acc, t) => (t.kind === "modifier" ? acc + t.value : acc),
        0,
      )
    : 0;
  const diceTerms = result?.terms.filter((t) => t.kind === "dice") ?? [];

  return (
    <div
      className={`flex min-h-[110px] max-h-[25vh] flex-col gap-2 rounded-lg border bg-bg/70 px-4 py-3 transition-[border-color,box-shadow] duration-300 sm:max-h-[300px] ${borderClass}`}
    >
      <span
        className={`shrink-0 font-fantasy text-5xl font-bold leading-none text-ink ${
          isRolling ? "animate-[dice-total-shake_0.08s_linear_infinite] text-gold" : ""
        }`}
      >
        {isRolling ? tumblingTotal : result ? result.total : "—"}
      </span>

      {!isRolling && result && (
        <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 pr-1">
          {diceTerms.map((term, idx) => (
            <DiceRow key={idx} term={term} />
          ))}
          {modifierTotal !== 0 && (
            <div className="font-fantasy text-base text-dim">
              {modifierTotal > 0 ? "+" : "−"} {Math.abs(modifierTotal)}
            </div>
          )}
        </div>
      )}

      {!result && !isRolling && (
        <div className="text-sm italic text-faint">
          Click dice below to build a set, then hit Roll.
        </div>
      )}
    </div>
  );
};

const sidesToType = (sides: number): DiceType => `d${sides}` as DiceType;

const DiceRow = ({ term }: { term: Extract<RolledTerm, { kind: "dice" }> }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-base text-dim">{term.sign === -1 ? "−" : "+"}</span>
      <DiceShape type={sidesToType(term.sides)} size={22} />
      <div className="custom-scrollbar-x flex min-w-0 flex-1 items-center gap-1 pb-1">
        {term.rolls.map((r, i) => {
          const isMax = r.value === r.sides;
          const isMin = r.value === 1;
          const base =
            "inline-flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded px-1.5 font-fantasy text-sm font-semibold";
          const variant = r.dropped
            ? "bg-transparent text-ink/45 line-through"
            : isMax && r.sides === 20
              ? "bg-leaf/25 text-leaf-soft"
              : isMin && r.sides === 20
                ? "bg-rust/25 text-rust-soft"
                : "bg-faint/20 text-ink";
          return (
            <span key={i} className={`${base} ${variant}`} title={`d${r.sides}: ${r.value}`}>
              {r.value}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default DiceResult;
