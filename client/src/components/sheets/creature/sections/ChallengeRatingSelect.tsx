import { useEffect, useRef, useState } from "react";
import { CHALLENGE_RATINGS } from "@/utils/dndMath";

type ChallengeRatingSelectProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

const chipClassName = (active: boolean) =>
  `rounded py-1 text-xs font-fantasy border transition-colors ${
    active
      ? "border-gold text-gold bg-surface-light"
      : "border-transparent text-dim hover:text-gold-bright hover:border-hover"
  }`;

export const ChallengeRatingSelect = ({ value, onChange }: ChallengeRatingSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = CHALLENGE_RATINGS.find((cr) => cr.value === value);

  const select = (next: number | null) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="cs-level-circle text-xl font-bold font-fantasy text-gold hover:text-gold-bright transition-colors"
      >
        {selected ? selected.label : "—"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-md border border-rule bg-surface shadow-xl p-2">
          <div className="custom-scrollbar max-h-60 overflow-y-auto grid grid-cols-4 gap-1 pr-1">
            <button
              type="button"
              onClick={() => select(null)}
              className={`col-span-4 ${chipClassName(value === null)}`}
            >
              —
            </button>
            {CHALLENGE_RATINGS.map((cr) => (
              <button
                key={cr.value}
                type="button"
                onClick={() => select(cr.value)}
                className={chipClassName(cr.value === value)}
              >
                {cr.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
