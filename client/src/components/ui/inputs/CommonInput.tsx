import { useState } from "react";

type CommonInputProps = {
  type: string;
  name: string;
  onChange?: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  validator?: (value: string | undefined) => { errorMessage: string | null; validatedValue: string | undefined };
  children?: React.ReactNode;
  inputClassName?: string;
  variant?: "underline" | "boxed";
};

function CommonInput({
  type,
  name,
  placeholder,
  validator,
  onChange,
  children,
  value,
  disabled,
  inputClassName,
  variant = "underline",
}: CommonInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (validator) {
      const { errorMessage, validatedValue } = validator(value);
      setError(errorMessage);
      e.target.value = validatedValue || "";
    }

    onChange?.(e.target.value);
  };

  const defaultTextColor = inputClassName ? "" : "text-ink";

  if (variant === "boxed") {
    return (
      <div className="flex flex-col gap-1">
        {children && (
          <label
            htmlFor={name}
            className={`font-fantasy text-[10px] uppercase tracking-[0.15em] ${error ? "text-rust" : "text-faint"}`}
          >
            {children}
          </label>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          className={`rounded-md border bg-bg/60 px-3 py-2 text-sm text-ink placeholder:text-faint/60 outline-none transition-colors duration-150 ${
            error
              ? "border-rust focus:border-rust"
              : "border-rule hover:border-hover focus:border-hover"
          } ${defaultTextColor} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${inputClassName ?? ""}`}
        />
        {error && <p className="text-rust text-xs">{error}</p>}
      </div>
    );
  }

  const labelTextColor = error ? "text-rust" : "text-dim";
  const inputBorderColor = error
    ? "border-rust"
    : disabled
      ? "border-transparent"
      : "border-rule hover:border-gold/50 focus-within:border-gold";
  const baseInputStyles = disabled
    ? "bg-transparent cursor-default"
    : "bg-surface-light/30 focus:outline-none focus:border-gold";

  return (
    <div>
      <label
        htmlFor={name}
        className={`flex flex-col gap-1 w-full pb-1 border-b ${inputBorderColor} transition-colors duration-200`}
      >
        <div className={`flex gap-1 items-center text-sm min-h-5 ${labelTextColor}`}>
          {children}
          {error ? `: ${error}` : " "}
        </div>
        <input
          type={type}
          name={name}
          placeholder={disabled ? "" : placeholder}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          className={`w-full bg-transparent border-0 p-0 outline-none ${baseInputStyles} ${defaultTextColor} ${inputClassName ?? ""}`}
        />
      </label>
    </div>
  );
}

export default CommonInput;
