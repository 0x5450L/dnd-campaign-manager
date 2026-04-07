type GradientInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  large?: boolean;
};

export const GradientInput = ({ value, onChange, placeholder, large }: GradientInputProps) => (
  <div className="cs-input-wrap">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cs-input"
      style={
        large
          ? { fontFamily: "var(--font-fantasy)", fontSize: "18px", fontWeight: 500 }
          : { fontSize: "13px" }
      }
      placeholder={placeholder}
    />
  </div>
);
