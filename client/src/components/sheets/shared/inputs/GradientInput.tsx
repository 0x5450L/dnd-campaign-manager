import { useState } from "react";

type GradientInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  large?: boolean;
  required?: boolean;
};

export const GradientInput = ({
  value,
  onChange,
  placeholder,
  large,
  required,
}: GradientInputProps) => {
  const [touched, setTouched] = useState(false);
  const isInvalid = required && touched && value.trim() === "";

  const handleChange = (next: string) => {
    if (!touched) setTouched(true);
    onChange(next);
  };

  return (
    <div
      className={`cs-input-wrap${isInvalid ? " required-empty" : ""}`}
      data-required={required ? "true" : undefined}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className="cs-input"
        style={
          large
            ? { fontFamily: "var(--font-fantasy)", fontSize: "18px", fontWeight: 500 }
            : { fontSize: "13px" }
        }
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={isInvalid || undefined}
      />
    </div>
  );
};
