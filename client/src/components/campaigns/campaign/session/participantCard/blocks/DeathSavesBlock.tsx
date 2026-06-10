type DeathSaveVariant = "success" | "failure";

type DeathSavesBlockProps = {
  successes: number;
  failures: number;
  canEdit: boolean;
  onRecord: (outcome: DeathSaveVariant) => void;
};

const checkStyle = (filled: boolean, variant: DeathSaveVariant) => {
  if (!filled) return "border-rule";
  return variant === "success"
    ? "border-frost-dim bg-frost-dim/20 text-frost-bright"
    : "border-fail-border bg-fail-bg text-fail";
};

const Check = ({
  filled,
  variant,
  onClick,
  disabled,
}: {
  filled: boolean;
  variant: DeathSaveVariant;
  onClick?: () => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={`${variant} ${filled ? "marked" : "empty"}`}
    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${checkStyle(filled, variant)} ${
      disabled ? "" : "hover:border-hover"
    }`}
  >
    {filled && <span className="text-sm leading-none">✦</span>}
  </button>
);

export const DeathSavesBlock = ({
  successes,
  failures,
  canEdit,
  onRecord,
}: DeathSavesBlockProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded border border-rule bg-bg/40 px-2.5 py-2">
      <span className="whitespace-nowrap font-fantasy text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
        Death saves
      </span>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase text-faint">Succ</span>
          {[0, 1, 2].map((i) => (
            <Check
              key={`s-${i}`}
              filled={i < successes}
              variant="success"
              disabled={!canEdit}
              onClick={canEdit ? () => onRecord("success") : undefined}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase text-faint">Fail</span>
          {[0, 1, 2].map((i) => (
            <Check
              key={`f-${i}`}
              filled={i < failures}
              variant="failure"
              disabled={!canEdit}
              onClick={canEdit ? () => onRecord("failure") : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeathSavesBlock;
