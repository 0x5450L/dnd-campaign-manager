import { NumericInput } from "../inputs/NumericInput";

type HitPointsProps = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  onUpdate: (field: string, value: number) => void;
};

export const HitPoints = ({ currentHp, maxHp, tempHp, onUpdate }: HitPointsProps) => {
  return (
    <div className="cs-section-card flex flex-col p-2" style={{ width: 150 }}>
      {/* Title */}
      <div
        className="cs-section-title"
        style={{ borderBottom: "none", marginBottom: 4 }}
      >
        Hit Points
      </div>

      {/* Row 1: Current HP */}
      <div className="flex flex-col items-center px-2 py-1">
        <div className="cs-input-wrap w-full">
          <NumericInput
            value={currentHp}
            onChange={(v) => onUpdate("currentHp", v)}
            min={0}
            max={9999}
            className="cs-input"
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontFamily: "var(--font-fantasy)",
              fontWeight: 600,
            }}
          />
        </div>
        <span className="cs-label mt-1">Current</span>
      </div>

      {/* Row 2: Temporary | Maximum */}
      <div className="flex items-stretch">
        <div className="flex-1 flex flex-col items-center px-2 py-1">
          <div className="cs-input-wrap w-full">
            <NumericInput
              value={tempHp}
              onChange={(v) => onUpdate("tempHp", v)}
              min={0}
              max={9999}
              className="cs-input"
              style={{ textAlign: "center", fontSize: "12px" }}
            />
          </div>
          <span className="cs-label mt-1">Temp</span>
        </div>

        <div className="flex-1 flex flex-col items-center px-2 py-1">
          <div className="cs-input-wrap w-full">
            <NumericInput
              value={maxHp}
              onChange={(v) => onUpdate("maxHp", v)}
              min={0}
              max={9999}
              className="cs-input"
              style={{ textAlign: "center", fontSize: "12px" }}
            />
          </div>
          <span className="cs-label mt-1">Max</span>
        </div>
      </div>
    </div>
  );
};
