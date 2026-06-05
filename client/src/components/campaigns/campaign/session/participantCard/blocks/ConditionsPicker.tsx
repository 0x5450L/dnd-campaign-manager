import { useMemo, useState } from "react";
import {
  CONDITIONS,
  CONDITION_THEME,
  isKnownCondition,
  type ConditionName,
} from "../conditions";
import ConditionIcon from "../conditionIcons";

type ConditionsPickerProps = {
  active: string[];
  isDM: boolean;
  onToggle: (condition: string) => void;
};

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const ConditionDot = ({
  condition,
  onClick,
  disabled,
}: {
  condition: ConditionName;
  onClick?: () => void;
  disabled: boolean;
}) => {
  const theme = CONDITION_THEME[condition];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={condition}
      aria-label={condition}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${theme.chipBorder} ${theme.chipBg} ${theme.chipText} transition-transform ${
        disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
      }`}
    >
      <ConditionIcon name={condition} className="h-5 w-5" />
    </button>
  );
};

export const ConditionsPicker = ({
  active,
  isDM,
  onToggle,
}: ConditionsPickerProps) => {
  const [open, setOpen] = useState(false);

  const activeKnown = useMemo(
    () => active.filter(isKnownCondition),
    [active],
  );

  const orderedList = useMemo<ConditionName[]>(() => {
    const activeSet = new Set(activeKnown);
    const head = CONDITIONS.filter((c) => activeSet.has(c));
    const tail = CONDITIONS.filter((c) => !activeSet.has(c));
    return [...head, ...tail];
  }, [activeKnown]);

  return (
    <div className="flex flex-wrap min-h-13 content-start items-start justify-start gap-2.5">
      {activeKnown.map((c) => (
        <ConditionDot
          key={c}
          condition={c}
          disabled={!isDM}
          onClick={isDM ? () => onToggle(c) : undefined}
        />
      ))}

      {isDM && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Manage conditions"
          className="flex h-7 w-7 items-center justify-center  rounded-full border border-dashed border-rule text-faint transition-colors hover:border-hover hover:text-ink"
        >
          <PlusIcon />
        </button>
      )}

      {open && (
        <div className="absolute inset-2 z-10 flex flex-col rounded-md border border-rule bg-surface/95 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-rule px-3 py-2">
            <span className="font-fantasy text-xs uppercase tracking-[0.18em] text-gold-bright">
              Conditions
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close conditions"
              className="text-faint transition-colors hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
          <ul className="custom-scrollbar flex flex-1 flex-col gap-0.5 p-1.5">
            {orderedList.map((c) => {
              const isActive = active.includes(c);
              const theme = CONDITION_THEME[c];
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => onToggle(c)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left font-fantasy text-[12px] uppercase tracking-wider transition-colors ${
                      isActive
                        ? `${theme.chipText} ${theme.chipBg}`
                        : "text-dim hover:bg-surface-light hover:text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${theme.chipBorder} ${theme.chipBg} ${theme.chipText}`}
                    >
                      <ConditionIcon name={c} className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1">{c}</span>
                    {isActive && <span className="text-[11px]">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConditionsPicker;
