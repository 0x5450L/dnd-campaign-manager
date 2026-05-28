import { useEffect, useRef, useState } from "react";
import {
  CONDITIONS,
  CONDITION_THEME,
  isKnownCondition,
  type ConditionName,
} from "../conditions";

type ConditionsPickerProps = {
  active: string[];
  isDM: boolean;
  onToggle: (condition: string) => void;
};

const chipClasses = (name: string) => {
  if (isKnownCondition(name)) {
    const t = CONDITION_THEME[name];
    return `${t.chipBorder} ${t.chipBg} ${t.chipText}`;
  }
  return "border-rule bg-surface text-dim";
};

export const ConditionsPicker = ({
  active,
  isDM,
  onToggle,
}: ConditionsPickerProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active.map((c) => (
        <button
          key={c}
          type="button"
          disabled={!isDM}
          onClick={() => onToggle(c)}
          className={`rounded border px-1.5 py-0.5 font-fantasy text-[10px] uppercase tracking-widest transition-opacity ${chipClasses(c)} ${
            isDM ? "cursor-pointer hover:opacity-80" : "cursor-default"
          }`}
        >
          {c}
        </button>
      ))}

      {isDM && (
        <div ref={wrapperRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded border border-dashed border-rule px-1.5 py-0.5 font-fantasy text-[10px] uppercase tracking-widest text-faint transition-colors hover:border-hover hover:text-ink"
          >
            + Condition
          </button>
          {open && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-rule bg-surface/95 p-1.5 shadow-lg backdrop-blur">
              <ul className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                {CONDITIONS.map((c: ConditionName) => {
                  const isActive = active.includes(c);
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => onToggle(c)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-left font-fantasy text-[11px] uppercase tracking-wider transition-colors ${
                          isActive
                            ? `${CONDITION_THEME[c].chipText} ${CONDITION_THEME[c].chipBg}`
                            : "text-dim hover:bg-surface-light hover:text-ink"
                        }`}
                      >
                        <span>{c}</span>
                        {isActive && <span className="text-[10px]">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConditionsPicker;
