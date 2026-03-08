import { useState } from "react";

type CommonInputProps = {
  type: string;
  name: string;
  onChange: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  validator?: (value: string | undefined) => { errorMessage: string | null; validatedValue: string | undefined };
  children?: React.ReactNode;
  inputClassName?: string;
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
}: CommonInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (validator) {
      const { errorMessage, validatedValue } = validator(value);
      setError(errorMessage);
      e.target.value = validatedValue || "";
    }

    onChange(e.target.value);
  };

  const labelTextColor = error ? "text-red-400" : "text-gray-400";
  const inputBorderColor = error
    ? "border-red-400"
    : disabled
      ? "border-transparent"
      : "border-gray-700 hover:border-amber-500/50 focus-within:border-amber-500";
  const baseInputStyles = disabled
    ? "bg-transparent cursor-default"
    : "bg-gray-700/30 focus:outline-none focus:border-amber-500";

  const defaultTextColor = inputClassName ? "" : "text-gray-200";

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
