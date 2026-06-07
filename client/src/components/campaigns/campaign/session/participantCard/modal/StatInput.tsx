import EditableNumber from "../blocks/EditableNumber";
import StatTile from "./StatTile";

type StatInputProps = {
  label: string;
  value: number;
  editable: boolean;
  onCommit?: (value: number) => void;
  min?: number;
  max?: number;
};

const noop = () => {};

export const StatInput = ({
  label,
  value,
  editable,
  onCommit,
  min,
  max,
}: StatInputProps) => (
  <StatTile label={label} focusable={editable}>
    <EditableNumber
      value={value}
      editable={editable}
      onCommit={onCommit ?? noop}
      min={min}
      max={max}
      ariaLabel={label}
      className="w-12 sm:w-14 font-fantasy text-xl sm:text-2xl font-bold leading-none text-ink"
    />
  </StatTile>
);

export default StatInput;
