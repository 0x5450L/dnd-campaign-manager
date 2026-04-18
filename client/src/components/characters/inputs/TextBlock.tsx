type TextBlockProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
};

export const TextBlock = ({ title, value, onChange }: TextBlockProps) => {
  return (
    <div className="cs-section-card p-3 flex flex-col">
      <div className="cs-section-title">{title}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cs-textarea min-h-20"
        placeholder={`${title}...`}
      />
    </div>
  );
};
