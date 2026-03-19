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
        <span className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</span>
      )}
      <NumericInput
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        defaultValue={min ?? 0}
        className="border border-gray-600 rounded text-gray-200 text-sm p-1 w-12 focus:border-amber-500"
      />
    </label>
  );
};
