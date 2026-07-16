import { NumericInput } from "../inputs/NumericInput";
import { useSheet, useSheetActions } from "@/state/sheet";

export const HitPoints = () => {
  const { currentHp, maxHp, tempHp } = useSheet((s) => ({
    currentHp: s.currentHp,
    maxHp: s.maxHp,
    tempHp: s.tempHp,
  }));
  const { setSharedField } = useSheetActions();

  return (
    <div className="cs-section-card flex flex-col p-3 justify-between flex-1">
      <div className="cs-section-title">Hit Points</div>

      <div className="flex flex-col items-center px-2 py-1">
        <div className="cs-input-wrap w-full">
          <NumericInput
            value={currentHp}
            onChange={(v) => setSharedField("currentHp", v)}
            min={0}
            max={maxHp}
            className="cs-input text-center text-lg font-semibold font-fantasy"
          />
        </div>
        <span className="cs-label mt-1">Current</span>
      </div>

      <div className="flex items-stretch">
        <div className="flex-1 flex flex-col items-center px-2 py-1">
          <div className="cs-input-wrap w-full">
            <NumericInput
              value={tempHp}
              onChange={(v) => setSharedField("tempHp", v)}
              min={0}
              max={9999}
              className="cs-input text-center text-xs"
            />
          </div>
          <span className="cs-label mt-1">Temp</span>
        </div>

        <div className="flex-1 flex flex-col items-center px-2 py-1">
          <div className="cs-input-wrap w-full">
            <NumericInput
              value={maxHp}
              onChange={(v) => {
                setSharedField("maxHp", v);
                if (currentHp > v) setSharedField("currentHp", v);
              }}
              min={0}
              max={9999}
              className="cs-input text-center text-xs"
            />
          </div>
          <span className="cs-label mt-1">Max</span>
        </div>
      </div>
    </div>
  );
};
