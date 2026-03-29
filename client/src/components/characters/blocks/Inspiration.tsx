type InspirationProps = {
  hasInspiration: boolean;
  onToggle: () => void;
};

export const Inspiration = ({ hasInspiration, onToggle }: InspirationProps) => {
  return (
    <div
      onClick={onToggle}
      className={`cs-inspiration ${hasInspiration ? "active" : ""}`}
    >
      <div
        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: hasInspiration ? "var(--color-gold)" : "var(--color-border)",
          background: hasInspiration ? "rgba(212, 165, 116, 0.2)" : "transparent",
        }}
      >
        {hasInspiration && (
          <span style={{ color: "var(--color-gold)", fontSize: "12px" }}>&#10022;</span>
        )}
      </div>
      <span
        className="text-[10px] uppercase tracking-[0.12em]"
        style={{
          fontFamily: "var(--font-fantasy)",
          color: hasInspiration ? "var(--color-gold)" : "var(--color-text-label)",
        }}
      >
        Heroic Inspiration
      </span>
    </div>
  );
};
