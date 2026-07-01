import { NumericInput } from "../inputs/NumericInput";
import { useCharacterSheet } from "../../../../hooks/useCharacterSheet";
import { SHIELD_AC_BONUS } from "../../../../utils/dndMath";

export const ArmorClass = () => {
  const { state, setField, toggleShield } = useCharacterSheet();
  const { ac, usesShield } = state;
  const displayAc = usesShield ? ac + SHIELD_AC_BONUS : ac;

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
          stroke="var(--color-rule)"
          strokeWidth="2.5"
          className="cs-ac-shield-path"
        />
      </svg>

      {/* Content */}
      <div className="cs-ac-shield-content">
        <span className="cs-ac-shield-label">Armor Class</span>
        <NumericInput
          value={displayAc}
          onChange={(v) => setField("ac", usesShield ? v - SHIELD_AC_BONUS : v)}
          min={0}
          max={30}
          defaultValue={10}
          className="cs-ac-shield-input"
        />

        {/* Shield toggle checkbox */}
        <div
          className="cs-ac-toggle"
          onClick={(e) => {
            e.stopPropagation();
            toggleShield();
          }}
        >
          <div className={`cs-ac-toggle-box ${usesShield ? "active" : ""}`}>
            {usesShield && <span>&#10022;</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
