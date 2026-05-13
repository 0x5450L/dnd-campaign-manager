import { useState } from "react";
import { useDiceRoller } from "../../context/diceRollerContext/useDiceRoller";
import type { DiceHistoryEntry } from "../../types/dice";

export const DiceHistory = () => {
  const { history, clearHistory, rerollFromHistory, showHistoryResult } =
    useDiceRoller();
  const [expanded, setExpanded] = useState(false);

  const isEmpty = history.length === 0;

  return (
    <div className="flex flex-col border-t border-rule pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-left transition-colors hover:bg-white/5"
      >
        <span className="font-fantasy text-sm uppercase tracking-widest text-faint">
          History
          {history.length > 0 && (
            <span className="ml-1.5 text-gold-dim">({history.length})</span>
          )}
        </span>
        <span
          className={`text-base text-faint transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${
          expanded
            ? "mt-2 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-2">
            {!isEmpty && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="cursor-pointer bg-transparent text-xs uppercase tracking-wider text-faint transition-colors hover:text-rust"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="custom-scrollbar flex max-h-[140px] sm:max-h-[200px] flex-col gap-1.5 pr-1">
              {isEmpty ? (
                <div className="py-3 text-center text-sm italic text-faint">
                  No rolls yet
                </div>
              ) : (
                history.map((entry) => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    onClick={() => showHistoryResult(entry)}
                    onReroll={() => rerollFromHistory(entry)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type ItemProps = {
  entry: DiceHistoryEntry;
  onClick: () => void;
  onReroll: () => void;
};

const HistoryItem = ({ entry, onClick, onReroll }: ItemProps) => {
  const totalColor = entry.critSuccess
    ? "text-[#b6e0b6]"
    : entry.critFail
      ? "text-[#f0a6a6]"
      : "text-gold-bright";

  const handleReroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReroll();
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-3 rounded border border-transparent bg-surface/50 px-3 py-2 text-sm transition-colors hover:border-rule hover:bg-surface"
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap font-fantasy text-ink">
        {entry.expression}
      </span>
      <span className={`min-w-[32px] text-right font-fantasy text-base font-bold ${totalColor}`}>
        {entry.total}
      </span>
      <button
        type="button"
        onClick={handleReroll}
        aria-label="Reroll this expression"
        className="cursor-pointer rounded border border-rule bg-transparent px-2 py-1 font-fantasy text-xs uppercase tracking-wider text-dim transition-colors hover:border-hover hover:text-gold-bright"
      >
        ↻
      </button>
    </div>
  );
};

export default DiceHistory;
