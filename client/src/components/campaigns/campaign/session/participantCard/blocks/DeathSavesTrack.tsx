import HpReadout from "./HpReadout";

type DeathSaveVariant = "success" | "failure";

type DeathSavesTrackProps = {
  successes: number;
  failures: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hidden: boolean;
  canEdit: boolean;
  onRecord: (outcome: DeathSaveVariant) => void;
};

const pipStyle = (filled: boolean, variant: DeathSaveVariant) => {
  if (!filled) return "border-rule";
  return variant === "success"
    ? "border-frost-dim bg-frost-dim/20 text-frost-bright"
    : "border-rust/70 bg-rust/20 text-rust-soft";
};

const Pip = ({
  filled,
  variant,
  canEdit,
  onRecord,
}: {
  filled: boolean;
  variant: DeathSaveVariant;
  canEdit: boolean;
  onRecord: (outcome: DeathSaveVariant) => void;
}) => (
  <button
    type="button"
    disabled={!canEdit}
    onClick={canEdit ? () => onRecord(variant) : undefined}
    aria-label={`${variant} ${filled ? "marked" : "empty"}`}
    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${pipStyle(filled, variant)} ${
      canEdit ? "hover:border-hover" : ""
    }`}
  >
    {filled && <span className="text-[11px] leading-none">✦</span>}
  </button>
);

export const DeathSavesTrack = ({
  successes,
  failures,
  currentHp,
  maxHp,
  tempHp,
  hidden,
  canEdit,
  onRecord,
}: DeathSavesTrackProps) => (
  <div className="flex w-full items-center gap-2">
    <div className="flex flex-1 items-center gap-1.5">
      <span className="font-fantasy text-[10px] uppercase tracking-[0.16em] text-rust-soft">
        Saves
      </span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <Pip
            key={`s-${i}`}
            filled={i < successes}
            variant="success"
            canEdit={canEdit}
            onRecord={onRecord}
          />
        ))}
      </div>
      <span className="text-faint">·</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <Pip
            key={`f-${i}`}
            filled={i < failures}
            variant="failure"
            canEdit={canEdit}
            onRecord={onRecord}
          />
        ))}
      </div>
    </div>
    <HpReadout
      currentHp={currentHp}
      maxHp={maxHp}
      tempHp={tempHp}
      hidden={hidden}
      downed
    />
  </div>
);

export default DeathSavesTrack;
