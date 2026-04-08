import { NumericInput } from "../inputs/NumericInput";
import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

export const HitPoints = () => {
  const { state, setField } = useCharacterSheet();

  return (
    <div
      className="cs-section-card flex flex-col p-3 justify-between"
      style={{ width: 150 }}
    >
      {/* Title */}
      <div className="cs-section-title">Hit Points</div>

      {/* Row 1: Current HP */}
      <div className="flex flex-col items-center px-2 py-1">
        <div className="cs-input-wrap w-full">
          <NumericInput
            value={state.currentHp}
            onChange={(v) => setField("currentHp", v)}
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
              value={state.tempHp}
              onChange={(v) => setField("tempHp", v)}
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
              value={state.maxHp}
              onChange={(v) => setField("maxHp", v)}
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
