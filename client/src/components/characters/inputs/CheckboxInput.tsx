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
          ${checked ? "border-gold bg-gold/20" : "border-rule group-hover:border-dim"}`}
      >
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
      </div>
      {label && <span className="text-dim text-xs">{label}</span>}
    </label>
  );
};
