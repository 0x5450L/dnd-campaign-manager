import EditableNumber from "./EditableNumber";
import { ShieldIcon } from "./icons";
import { STAT_BLOCK_SIZES, type StatBlockSize } from "./statBlockSizes";

type ArmorClassBlockProps = {
  value: number;
  hidden: boolean;
  isDM: boolean;
  size?: StatBlockSize;
  onChange?: (value: number) => void;
  onToggleHidden?: () => void;
};

export const ArmorClassBlock = ({
  value,
  hidden,
  isDM,
  size = "md",
  onChange,
  onToggleHidden,
}: ArmorClassBlockProps) => {
  const styles = STAT_BLOCK_SIZES[size];
  const masked = hidden && !isDM;
  const valueColor = masked
    ? "text-faint"
    : hidden && isDM
      ? "text-dim"
      : "text-ink";

  return (
    <div
      className={`relative flex ${styles.box} shrink-0 flex-col items-center justify-center rounded-md border border-rule bg-bg/60 font-fantasy text-ink ${
        onChange ? "focus-within:border-hover" : ""
      }`}
    >
      <span
        className={`font-fantasy ${styles.label} font-bold uppercase tracking-[0.18em] text-gold-bright`}
      >
        AC
      </span>
      {masked ? (
        <span className={`${styles.value} font-bold leading-none text-faint`}>
          ??
        </span>
      ) : onChange ? (
        <EditableNumber
          value={value}
          editable
          onCommit={onChange}
          min={0}
          ariaLabel="Armor class"
          className={`${styles.input} font-fantasy font-bold leading-none ${valueColor}`}
        />
      ) : (
        <span className={`${styles.value} font-bold leading-none ${valueColor}`}>
          {value}
        </span>
      )}
      {isDM && onToggleHidden && (
        <button
          type="button"
          onClick={onToggleHidden}
          aria-label={hidden ? "Reveal AC to players" : "Hide AC from players"}
          title={hidden ? "AC hidden from players" : "AC visible to players"}
          className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border bg-surface transition-colors ${
            hidden
              ? "border-arcane/60 text-arcane-soft"
              : "border-rule text-faint hover:text-ink"
          }`}
        >
          <ShieldIcon question={hidden} />
        </button>
      )}
    </div>
  );
};

export default ArmorClassBlock;
