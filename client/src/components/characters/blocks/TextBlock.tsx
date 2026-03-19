type TextBlockProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
};

export const TextBlock = ({ title, value, onChange, minHeight = "120px" }: TextBlockProps) => {
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-3 flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">{title}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-gray-200 text-xs outline-none resize-none flex-1"
        style={{ minHeight }}
        placeholder={`${title}...`}
      />
    </div>
  );
};
