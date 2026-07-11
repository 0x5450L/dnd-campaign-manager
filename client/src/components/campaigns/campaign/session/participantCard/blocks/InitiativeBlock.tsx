import EditableNumber from "./EditableNumber";
import { STAT_BLOCK_SIZES } from "../../../../../../constants/statBlockSizes";
import type { StatBlockSize } from "../../../../../../types/components/participantCard";

type InitiativeBlockProps = {
  value: number;
  isActive: boolean;
  size?: StatBlockSize;
  onChange?: (value: number) => void;
};

export const InitiativeBlock = ({
  value,
  isActive,
  size = "md",
  onChange,
}: InitiativeBlockProps) => {
  const styles = STAT_BLOCK_SIZES[size];

  return (
    <div
      className={`flex ${styles.box} shrink-0 flex-col items-center justify-center rounded-md border bg-bg/60 font-fantasy transition-colors ${
        isActive
          ? "border-gold bg-gold/10 text-gold-bright"
          : "border-rule text-gold"
      } ${onChange ? "focus-within:border-hover" : ""}`}
    >
      <span
        className={`font-fantasy ${styles.label} font-bold uppercase tracking-[0.18em] text-gold-bright`}
      >
        Init
      </span>
      {onChange ? (
        <EditableNumber
          value={value}
          editable
          onCommit={onChange}
          min={0}
          ariaLabel="Initiative"
          className={`${styles.input} font-fantasy font-bold leading-none text-inherit`}
        />
      ) : (
        <span className={`${styles.value} font-bold leading-none`}>{value}</span>
      )}
    </div>
  );
};

export default InitiativeBlock;
