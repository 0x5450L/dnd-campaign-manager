import { SHIELD_AC_BONUS } from "@/utils/dndMath";
import EditableNumber from "./EditableNumber";
import { ShieldIcon, ShieldPlusIcon } from "./icons";
import { STAT_BLOCK_SIZES } from "@/constants/statBlockSizes";
import type { StatBlockSize } from "@/types/components/participantCard";

type ArmorClassBlockProps = {
  value: number;
  hidden: boolean;
  isDM: boolean;
  usesShield?: boolean;
  size?: StatBlockSize;
  onChange?: (value: number) => void;
  onToggleHidden?: () => void;
  onToggleShield?: () => void;
};

export const ArmorClassBlock = ({
  value,
  hidden,
  isDM,
  usesShield = false,
  size = "md",
  onChange,
  onToggleHidden,
  onToggleShield,
}: ArmorClassBlockProps) => {
  const styles = STAT_BLOCK_SIZES[size];
  const masked = hidden && !isDM;
  const displayValue = value + (usesShield ? SHIELD_AC_BONUS : 0);
  const valueColor = masked
    ? "text-faint"
    : usesShield
      ? "text-gold-bright"
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
          value={displayValue}
          editable
          onCommit={(v) => onChange(usesShield ? v - SHIELD_AC_BONUS : v)}
          min={0}
          ariaLabel="Armor class"
          className={`${styles.input} font-fantasy font-bold leading-none ${valueColor}`}
        />
      ) : (
        <span className={`${styles.value} font-bold leading-none ${valueColor}`}>
          {displayValue}
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
      {onToggleShield && (
        <button
          type="button"
          onClick={onToggleShield}
          aria-label={usesShield ? "Lower shield" : "Raise shield"}
          title={
            usesShield
              ? `Shield up (+${SHIELD_AC_BONUS} AC)`
              : `Raise shield (+${SHIELD_AC_BONUS} AC)`
          }
          className={`absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
            usesShield
              ? "border-gold bg-gold/25 text-gold-bright"
              : "border-rule bg-surface text-faint hover:text-ink"
          }`}
        >
          <ShieldPlusIcon />
        </button>
      )}
    </div>
  );
};

export default ArmorClassBlock;
