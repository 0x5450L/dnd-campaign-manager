import { useEffect, useRef, useState } from "react";
import { clamp } from "../../../../../../utils/dndMath";

type EditableNumberProps = {
  value: number;
  editable: boolean;
  onCommit: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
  ariaLabel?: string;
};

export const EditableNumber = ({
  value,
  editable,
  onCommit,
  className = "",
  min,
  max,
  ariaLabel,
}: EditableNumberProps) => {
  const [draft, setDraft] = useState(String(value));
  const cancelled = useRef(false);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(
      Math.floor(parsed),
      min ?? Number.MIN_SAFE_INTEGER,
      max ?? Number.MAX_SAFE_INTEGER,
    );
    setDraft(String(next));
    if (next !== value) onCommit(next);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      readOnly={!editable}
      tabIndex={editable ? 0 : -1}
      aria-label={ariaLabel}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
      className={`bg-transparent text-center outline-none ${
        editable ? "cursor-text" : "cursor-default select-none"
      } ${className}`}
    />
  );
};

export default EditableNumber;
