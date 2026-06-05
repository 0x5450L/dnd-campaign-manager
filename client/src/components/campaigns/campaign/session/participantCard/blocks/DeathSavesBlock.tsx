type DeathSavesBlockProps = {
  successes: number;
  failures: number;
  canEdit: boolean;
  onRecord: (outcome: "success" | "failure") => void;
};

const Dot = ({
  filled,
  variant,
  onClick,
  disabled,
}: {
  filled: boolean;
  variant: "success" | "failure";
  onClick?: () => void;
  disabled: boolean;
}) => {
  const color =
    variant === "success"
      ? filled
        ? "border-[#b0c4d8] bg-[#b0c4d8]/40"
        : "border-rule"
      : filled
        ? "border-rust bg-rust/40"
        : "border-rule";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${variant} ${filled ? "marked" : "empty"}`}
      className={`h-3.5 w-3.5 rounded-full border transition-colors ${color} ${
        disabled ? "cursor-default" : "cursor-pointer hover:border-hover"
      }`}
    />
  );
};

export const DeathSavesBlock = ({
  successes,
  failures,
  canEdit,
  onRecord,
}: DeathSavesBlockProps) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-rust/40 bg-rust/5 px-2 py-2">
      <span className="font-fantasy text-[11px] uppercase tracking-[0.18em] text-[#f1c2c2]">
        Death saves
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase text-faint">Succ</span>
          {[0, 1, 2].map((i) => (
            <Dot
              key={`s-${i}`}
              filled={i < successes}
              variant="success"
              disabled={!canEdit}
              onClick={canEdit ? () => onRecord("success") : undefined}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase text-faint">Fail</span>
          {[0, 1, 2].map((i) => (
            <Dot
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
