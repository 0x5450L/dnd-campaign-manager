export const SimpleInfoInput = ({
  label,
  value,
  onChange,
  labelAlign = "center",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  labelAlign?: "center" | "left" | "right";
  placeholder?: string;
}) => {
  const alignClass = labelAlign === "left" ? "text-left" : labelAlign === "right" ? "text-right" : "text-center";

  return (
    <label className="flex flex-col gap-0.5">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent border-0 p-1 outline-none text-gray-200 text-sm ${alignClass}`}
      />
      <span className={`text-gray-500 text-[10px] uppercase tracking-wider pt-1 border-t border-gray-600 ${alignClass}`}>
        {label}
      </span>
    </label>
  );
};
