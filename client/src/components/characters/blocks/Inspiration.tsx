type InspirationProps = {
  hasInspiration: boolean;
  onToggle: () => void;
};

export const Inspiration = ({ hasInspiration, onToggle }: InspirationProps) => {
  return (
    <div
      onClick={onToggle}
      className={`border rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-colors
        ${hasInspiration
          ? "border-amber-500 bg-amber-500/10"
          : "border-gray-700 bg-gray-800/30 hover:border-gray-500"
        }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
        ${hasInspiration ? "border-amber-500 bg-amber-500/20" : "border-gray-600"}`}
      >
        {hasInspiration && <span className="text-amber-400 text-xs">✦</span>}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-gray-400">Heroic Inspiration</span>
    </div>
  );
};
