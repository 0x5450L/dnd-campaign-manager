export const CheckboxInput = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) => {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors
          ${checked ? "border-amber-500 bg-amber-500/20" : "border-gray-600 group-hover:border-gray-400"}`}
      >
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      </div>
      {label && <span className="text-gray-400 text-xs">{label}</span>}
    </label>
  );
};
