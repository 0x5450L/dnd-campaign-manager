import { useEffect, useRef, useState } from "react";

type EditableTextProps = {
  value: string;
  editable: boolean;
  onCommit: (value: string) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  allowEmpty?: boolean;
};

export const EditableText = ({
  value,
  editable,
  onCommit,
  className = "",
  placeholder,
  ariaLabel,
  allowEmpty = false,
}: EditableTextProps) => {
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const next = draft.trim();
    if (next.length === 0 && !allowEmpty) {
      setDraft(value);
      return;
    }
    if (next !== value) onCommit(next);
    else setDraft(next);
  };

  return (
    <input
      type="text"
      value={draft}
      readOnly={!editable}
      tabIndex={editable ? 0 : -1}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
      className={`bg-transparent outline-none ${
        editable ? "cursor-text" : "cursor-default select-none"
      } ${className}`}
    />
  );
};

export default EditableText;
