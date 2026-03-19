import { useState } from "react";

type NumericInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
  className?: string;
};

export const NumericInput = ({
  value,
  onChange,
  min,
  max,
  defaultValue = 0,
  className = "",
}: NumericInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(String(value));

  // Sync display when parent value changes externally
  if (displayValue !== "" && Number(displayValue) !== value) {
    setDisplayValue(String(value));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty field and minus sign
    if (raw === "" || raw === "-") {
      setDisplayValue(raw);
      return;
    }

    const num = parseInt(raw, 10);
    if (isNaN(num)) return;

    if (min !== undefined && num < min) return;
    if (max !== undefined && num > max) return;

    setDisplayValue(raw);
    onChange(num);
  };

  const handleBlur = () => {
    // On blur, if field is empty or invalid, restore default
    if (displayValue === "" || displayValue === "-") {
      setDisplayValue(String(defaultValue));
      onChange(defaultValue);
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`bg-transparent text-center outline-none transition-colors ${className}`}
    />
  );
};
