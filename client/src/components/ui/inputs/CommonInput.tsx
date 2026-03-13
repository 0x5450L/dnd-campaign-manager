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

  const defaultTextColor = inputClassName ? "" : "text-gray-200";

  if (variant === "boxed") {
    return (
      <div className="flex flex-col gap-1">
        {children && (
          <label htmlFor={name} className={`text-sm ${error ? "text-red-400" : "text-gray-400"}`}>
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
          className={`bg-gray-700 border rounded-lg p-2.5 placeholder-gray-400 focus:outline-none transition-colors duration-200 ${
            error ? "border-red-400" : "border-gray-600 focus:border-amber-500 hover:border-amber-500/50"
          } ${defaultTextColor} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${inputClassName ?? ""}`}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  // underline variant (default)
  const labelTextColor = error ? "text-red-400" : "text-gray-400";
  const inputBorderColor = error
    ? "border-red-400"
    : disabled
      ? "border-transparent"
      : "border-gray-700 hover:border-amber-500/50 focus-within:border-amber-500";
  const baseInputStyles = disabled
    ? "bg-transparent cursor-default"
    : "bg-gray-700/30 focus:outline-none focus:border-amber-500";

  return (
    <div>
      <label
        htmlFor={name}
        className={`flex flex-col gap-1 w-full pb-1 border-b ${inputBorderColor} transition-colors duration-200`}
      >
        <div className={`flex gap-1 items-center text-sm min-h-5 ${labelTextColor}`}>
          {children}
          {error ? `: ${error}` : "\u00A0"}
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
