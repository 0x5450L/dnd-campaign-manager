import { useState } from "react";
import {
  SPELL_SLOT_LEVELS,
  SPELL_SLOT_MAX_BY_LEVEL,
} from "@shared/constants/dnd";
import type { SpellSlotLevel } from "@shared/types/dnd";
import type { AbilityUsageAction } from "@shared/types/abilities";

type SpellSlotsTrackerProps = {
  slots: SpellSlotLevel[] | null;
  editable: boolean;
  onChange?: (slots: SpellSlotLevel[]) => void;
  onCapacityCommit?: (slots: SpellSlotLevel[]) => void;
  onToggleUsed?: (level: number, action: AbilityUsageAction, count: number) => void;
};

const emptyLevel = (level: number): SpellSlotLevel => ({
  level,
  total: 0,
  used: 0,
});

const normalize = (slots: SpellSlotLevel[] | null): Map<number, SpellSlotLevel> => {
  const map = new Map<number, SpellSlotLevel>();
  (slots ?? []).forEach((slot) => map.set(slot.level, slot));
  return map;
};

export const SpellSlotsTracker = ({
  slots,
  editable,
  onChange,
  onCapacityCommit,
  onToggleUsed,
}: SpellSlotsTrackerProps) => {
  const byLevel = normalize(slots);
  const configured = SPELL_SLOT_LEVELS.map(
    (level) => byLevel.get(level) ?? emptyLevel(level),
  ).filter((slot) => slot.total > 0);

  const hasSlots = configured.length > 0;
  const remaining = configured.reduce((sum, s) => sum + (s.total - s.used), 0);
  const totalSlots = configured.reduce((sum, s) => sum + s.total, 0);

  const capacityEditable = editable && (!!onChange || !!onCapacityCommit);

  const [collapsed, setCollapsed] = useState(() => !hasSlots);
  const [editing, setEditing] = useState(false);

  const buildResult = (next: Map<number, SpellSlotLevel>): SpellSlotLevel[] =>
    SPELL_SLOT_LEVELS.map((level) => next.get(level))
      .filter((slot): slot is SpellSlotLevel => !!slot && slot.total > 0)
      .map((slot) => ({
        level: slot.level,
        total: slot.total,
        used: Math.min(slot.used, slot.total),
      }));

  const commit = (next: Map<number, SpellSlotLevel>) => {
    if (!onChange) return;
    onChange(buildResult(next));
  };

  const setCapacity = (level: number, total: number) => {
    if (!editable) return;
    const next = normalize(slots);
    const current = next.get(level) ?? emptyLevel(level);
    next.set(level, {
      level,
      total,
      used: Math.min(current.used, total),
    });
    if (onCapacityCommit) {
      onCapacityCommit(buildResult(next));
      return;
    }
    commit(next);
  };

  const toggleUsed = (level: number, index: number) => {
    if (!editable) return;
    const next = normalize(slots);
    const current = next.get(level);
    if (!current) return;
    if (onToggleUsed) {
      const target = index < current.used ? index : index + 1;
      const count = Math.abs(target - current.used);
      if (count === 0) return;
      onToggleUsed(level, target < current.used ? "restore" : "spend", count);
      return;
    }
    const used = index < current.used ? index : index + 1;
    next.set(level, {
      ...current,
      used: Math.max(0, Math.min(used, current.total)),
    });
    commit(next);
  };

  const dot = (filled: boolean, dashed: boolean) =>
    `h-6 w-6 sm:h-5 sm:w-5 rounded-full border transition-colors ${
      filled
        ? "border-gold-dim bg-gold-dim/80"
        : dashed
          ? "border-rule border-dashed bg-transparent"
          : "border-rule bg-transparent"
    } ${editable ? "cursor-pointer hover:border-hover" : "cursor-default"}`;

  return (
    <div className="flex flex-col rounded border border-rule bg-bg/40">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between gap-2 px-3 py-2.5"
      >
        <span className="flex items-center gap-2">
          <span
            className={`text-faint transition-transform ${collapsed ? "" : "rotate-90"}`}
            aria-hidden
          >
            ▸
          </span>
          <span className="font-fantasy text-xs font-semibold uppercase tracking-[0.18em] text-gold-bright">
            Spell slots
          </span>
        </span>
        {hasSlots && (
          <span className="font-fantasy text-xs tracking-wider text-faint">
            {remaining}/{totalSlots}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2 border-t border-rule/60 px-3 py-2.5">
          {editable && (
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] italic text-faint">
                {editing
                  ? "Tap to set how many slots you have"
                  : "Tap a slot to spend or restore it"}
              </span>
              {capacityEditable && (
                <button
                  type="button"
                  onClick={() => setEditing((e) => !e)}
                  className="font-fantasy text-xs uppercase tracking-widest text-dim transition-colors hover:text-gold-bright"
                >
                  {editing ? "Done" : "Edit"}
                </button>
              )}
            </div>
          )}

          {editing ? (
            <div className="flex flex-col gap-1.5">
              {SPELL_SLOT_LEVELS.map((level) => {
                const total = byLevel.get(level)?.total ?? 0;
                const max = SPELL_SLOT_MAX_BY_LEVEL[level];
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="w-12 shrink-0 font-fantasy text-xs font-semibold uppercase tracking-[0.14em] text-gold-bright">
                      Lvl {level}
                    </span>
                    <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-1.5">
                      {Array.from({ length: max }, (_, i) => {
                        const active = i < total;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCapacity(level, active ? i : i + 1)}
                            aria-label={`Level ${level} capacity ${i + 1}`}
                            className={dot(active, !active)}
                          />
                        );
                      })}
                    </div>
                    <span className="w-6 shrink-0 text-right font-fantasy text-xs tracking-wider text-faint">
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : hasSlots ? (
            <div className="flex flex-col gap-2">
              {configured.map((slot) => (
                <div key={slot.level} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-fantasy text-xs font-semibold uppercase tracking-[0.14em] text-gold-bright">
                    Lvl {slot.level}
                  </span>
                  <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-1.5">
                    {Array.from({ length: slot.total }, (_, i) => {
                      const isUsed = i < slot.used;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!editable}
                          onClick={() => toggleUsed(slot.level, i)}
                          aria-label={`Level ${slot.level} slot ${i + 1}, ${isUsed ? "used" : "available"}`}
                          className={dot(isUsed, false)}
                        />
                      );
                    })}
                  </div>
                  <span className="w-10 shrink-0 text-right font-fantasy text-xs tracking-wider text-faint">
                    {slot.total - slot.used}/{slot.total}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-1 text-center text-xs italic text-faint">
              {capacityEditable
                ? "No spell slots yet. Tap Edit to add them."
                : "No spell slots."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SpellSlotsTracker;
