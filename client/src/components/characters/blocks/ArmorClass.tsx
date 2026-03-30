import { NumericInput } from "../inputs/NumericInput";

type ArmorClassProps = {
  ac: number;
  usesShield: boolean;
  onToggleShield: () => void;
  onUpdate: (field: string, value: number) => void;
};

export const ArmorClass = ({ ac, usesShield, onToggleShield, onUpdate }: ArmorClassProps) => {
  const displayAc = usesShield ? ac + 2 : ac;

  return (
    <div className={`cs-ac-shield ${usesShield ? "active" : ""}`}>
      {/* SVG shield shape */}
      <svg viewBox="0 0 100 130" className="cs-ac-shield-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(61,61,92,0.3)" />
            <stop offset="100%" stopColor="rgba(15,15,26,0.6)" />
          </linearGradient>
        </defs>
        <path
          d="M50 2 L96 16 L96 60 Q96 100 50 126 Q4 100 4 60 L4 16 Z"
          fill="url(#shieldGrad)"
          stroke="var(--color-border)"
          strokeWidth="2.5"
          className="cs-ac-shield-path"
        />
      </svg>

      {/* Content */}
      <div className="cs-ac-shield-content">
        <span className="cs-ac-shield-label">Armor Class</span>
        <NumericInput
          value={displayAc}
          onChange={(v) => onUpdate("ac", usesShield ? v - 2 : v)}
          min={0}
          max={30}
          defaultValue={10}
          className="cs-ac-shield-input"
        />

        {/* Shield toggle checkbox */}
        <div className="cs-ac-toggle" onClick={(e) => { e.stopPropagation(); onToggleShield(); }}>
          <div
            className="cs-ac-toggle-box"
            style={{
              borderColor: usesShield ? "var(--color-gold)" : "var(--color-border)",
              background: usesShield ? "rgba(212, 165, 116, 0.2)" : "transparent",
            }}
          >
            {usesShield && <span>&#10022;</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
