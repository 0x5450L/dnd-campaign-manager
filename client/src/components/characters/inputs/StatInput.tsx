import { NumericInput } from "./NumericInput";

export const StatInput = ({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) => {
  return (
    <label className="flex flex-col items-center gap-0.5">
      {label && (
        <span className="text-faint text-[10px] uppercase tracking-wider">{label}</span>
      )}
      <NumericInput
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        defaultValue={min ?? 0}
        className="border border-rule rounded text-ink text-sm p-1 w-12 focus:border-gold"
      />
    </label>
  );
};
