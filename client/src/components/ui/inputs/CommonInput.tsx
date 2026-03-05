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
};

function CommonInput({ type, name, placeholder, validator, onChange, children, value, disabled }: CommonInputProps) {
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

  const labelTextColor = error ? `text-red-400` : `text-gray-400`;
  const inputBorderColor = error ? `border-red-400` : `border-gray-700`;

  return (
    <div className="common-input-wrapper">
      <label
        htmlFor={name}
        className={`flex flex-col gap-2 w-full align-left pd-2 pd-b-4 border-b ${inputBorderColor}`}
      >
        <div className={`label-error-wrapper flex gap-1 items-center align-baseline text-sm ${labelTextColor}`}>
          {children} {error ? `: ${error}` : '\u00A0'}
        </div>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          className=""
        />
      </label>
    </div>
  );
}

export default CommonInput;
