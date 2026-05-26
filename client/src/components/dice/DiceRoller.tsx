import { useEffect } from "react";
import { useDiceRoller } from "../../context/diceRollerContext/useDiceRoller";
import { DICE_TYPES, type AdvDis, type DiceType } from "../../types/dice";
import DiceShape from "./DiceShape";
import DiceResult from "./DiceResult";
import DiceHistory from "./DiceHistory";
import CommonButton from "../ui/buttons/CommonButton";

export const DiceRoller = () => {
  const {
    isOpen,
    isRolling,
    formula,
    mode,
    lastResult,
    error,
    close,
    toggle,
    setFormula,
    setMode,
    addDie,
    clearFormula,
    roll,
  } = useDiceRoller();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const fabGlow = lastResult?.critSuccess
    ? "success"
    : lastResult?.critFail
      ? "fail"
      : "none";

  const badgeColor = lastResult?.critSuccess
    ? "bg-leaf text-bg"
    : lastResult?.critFail
      ? "bg-rust text-bg"
      : "bg-gold-dim text-bg";

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Dice Roller"
          className="fixed inset-0 z-[70] flex flex-col gap-5 border-0 bg-gradient-to-b from-surface to-bg p-5 pb-6 font-body shadow-[0_20px_40px_rgba(0,0,0,0.55)] animate-[dice-panel-in_0.18s_ease-out] sm:inset-auto sm:bottom-[110px] sm:right-6 sm:w-[420px] sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100dvh-130px)] sm:gap-4 sm:rounded-xl sm:border-[1.5px] sm:border-rule sm:p-5"
        >
          <div className="flex shrink-0 items-center justify-between">
            <span className="font-fantasy text-base uppercase tracking-[0.14em] text-gold">
              Dice Roller
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xl leading-none text-dim transition-colors hover:bg-white/5 hover:text-ink"
            >
              ✕
            </button>
          </div>

          <DiceResult result={lastResult} isRolling={isRolling} error={error} />

          <div className="grid shrink-0 grid-cols-7 gap-1.5">
            {DICE_TYPES.map((d) => (
              <QuickDieButton
                key={d}
                type={d}
                onClick={() => addDie(d)}
                disabled={isRolling}
              />
            ))}
          </div>

          <div className="flex shrink-0 items-stretch gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRolling) roll();
                }}
                placeholder="Click dice or type: 1d20+5, 4d6kh3..."
                spellCheck={false}
                className={`w-full rounded-md border bg-bg/85 px-3 py-3 pr-9 font-fantasy text-base text-ink outline-none transition-colors hover:border-hover focus:border-hover ${error ? "border-rust" : "border-rule"}`}
              />
              {formula && (
                <button
                  type="button"
                  onClick={clearFormula}
                  aria-label="Clear formula"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-base leading-none text-faint transition-colors hover:bg-white/5 hover:text-ink"
                >
                  ×
                </button>
              )}
            </div>
            <CommonButton
              onClick={() => roll()}
              disabled={isRolling || !formula.trim()}
              size="lg"
            >
              Roll
            </CommonButton>
          </div>

          <div className="flex shrink-0 gap-1.5">
            <ModeButton mode="advantage" label="Advantage" current={mode} onSelect={setMode} />
            <ModeButton mode="normal" label="Normal" current={mode} onSelect={setMode} />
            <ModeButton mode="disadvantage" label="Disadvantage" current={mode} onSelect={setMode} />
          </div>

          <DiceHistory />
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close dice roller" : "Open dice roller"}
        className={`fixed bottom-6 right-6 z-[60] h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-full border-2 bg-gradient-to-b from-surface-light to-surface text-gold shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-hover hover:shadow-[0_8px_20px_rgba(0,0,0,0.55)] ${
          isOpen ? "hidden sm:flex" : "flex"
        } ${isOpen ? "border-gold-dim" : "border-rule"}`}
      >
        <span className="relative inline-flex items-center justify-center">
          <DiceShape type="d20" size={50} glow={fabGlow} rolling={isRolling} />
          {lastResult && !isRolling && (
            <span
              className={`absolute -right-2 -top-2 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-surface px-1.5 font-fantasy text-xs font-bold ${badgeColor}`}
            >
              {lastResult.total}
            </span>
          )}
        </span>
      </button>
    </>
  );
};

type QuickDieProps = {
  type: DiceType;
  onClick: () => void;
  disabled?: boolean;
};

const QuickDieButton = ({ type, onClick, disabled }: QuickDieProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={`Add 1${type} to formula`}
    title={`Add 1${type}`}
    className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-rule bg-transparent px-1 py-2 text-dim transition-colors hover:border-hover hover:bg-hover/10 hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
  >
    <DiceShape type={type} size={40} />
    <span className="font-fantasy text-xs tracking-wider">{type}</span>
  </button>
);

type ModeButtonProps = {
  mode: AdvDis;
  label: string;
  current: AdvDis;
  onSelect: (mode: AdvDis) => void;
};

const ModeButton = ({ mode, label, current, onSelect }: ModeButtonProps) => {
  const active = current === mode;
  const variant = !active
    ? "border-rule text-dim hover:border-hover hover:text-ink"
    : mode === "advantage"
      ? "border-leaf bg-leaf/10 text-[#c2e8c2]"
      : mode === "disadvantage"
        ? "border-rust bg-rust/10 text-[#f1c2c2]"
        : "border-gold-dim bg-gold/10 text-gold-bright";
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={`flex-1 cursor-pointer rounded-md border bg-transparent px-1 py-2 font-fantasy text-xs uppercase tracking-widest transition-colors ${variant}`}
    >
      {label}
    </button>
  );
};

export default DiceRoller;
