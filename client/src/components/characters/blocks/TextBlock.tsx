type TextBlockProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
};

export const TextBlock = ({ title, value, onChange, minHeight = "120px" }: TextBlockProps) => {
  return (
    <div className="cs-section-card p-3 flex flex-col">
      <div className="cs-section-title">{title}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cs-textarea"
        style={{ minHeight }}
        placeholder={`${title}...`}
      />
    </div>
  );
};
