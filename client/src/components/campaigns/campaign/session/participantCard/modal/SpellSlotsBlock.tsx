import type { SpellSlotLevel } from "../../../../../../types/session";

type SpellSlotsBlockProps = {
  slots: SpellSlotLevel[] | null;
  editable: boolean;
  onChange?: (slots: SpellSlotLevel[]) => void;
};

export const SpellSlotsBlock = ({
  slots,
  editable,
  onChange,
}: SpellSlotsBlockProps) => {
  const levels = (slots ?? [])
    .filter((s) => s.total > 0)
    .sort((a, b) => a.level - b.level);

  if (levels.length === 0) {
    return (
      <div className="rounded border border-rule bg-bg/40 px-3 py-3 text-center text-xs italic text-faint">
        No spell slots. Slot counts are configured on the character sheet.
      </div>
    );
  }

  const toggleSlot = (level: number, slotIndex: number) => {
    if (!editable || !onChange || !slots) return;
    onChange(
      slots.map((s) => {
        if (s.level !== level) return s;
        const used = slotIndex < s.used ? slotIndex : slotIndex + 1;
        return { ...s, used: Math.max(0, Math.min(used, s.total)) };
      }),
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded border border-rule bg-bg/40 px-3 py-2.5">
      {levels.map((slot) => (
        <div key={slot.level} className="flex items-center gap-3">
          <span className="w-10 shrink-0 font-fantasy text-xs font-semibold uppercase tracking-[0.14em] text-gold-bright">
            Lvl {slot.level}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {Array.from({ length: slot.total }, (_, i) => {
              const isUsed = i < slot.used;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!editable}
                  onClick={() => toggleSlot(slot.level, i)}
                  aria-label={`Level ${slot.level} slot ${i + 1}, ${isUsed ? "used" : "available"}`}
                  className={`h-5 w-5 rounded-full border transition-colors ${
                    isUsed
                      ? "border-gold-dim bg-gold-dim/80"
                      : "border-rule bg-transparent"
                  } ${
                    editable
                      ? "cursor-pointer hover:border-hover"
                      : "cursor-default"
                  }`}
                />
              );
            })}
          </div>
          <span className="shrink-0 font-fantasy text-xs tracking-wider text-faint">
            {slot.total - slot.used}/{slot.total}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SpellSlotsBlock;
