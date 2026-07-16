import { NumericInput } from "../inputs/NumericInput";
import {
  getInitiative,
  getPassivePerception,
  getSheetProficiencyBonus,
  useSheet,
  useSheetActions,
} from "@/state/sheet";

export const CombatStats = () => {
  const {
    initiative,
    speed,
    size,
    proficiencyBonus,
    passivePerception,
    hasInspiration,
    showInspiration,
  } = useSheet((s) => ({
    initiative: getInitiative(s),
    speed: s.speed,
    size: s.size,
    proficiencyBonus: getSheetProficiencyBonus(s),
    passivePerception: getPassivePerception(s),
    hasInspiration: s.kind === "character" ? s.inspiration : false,
    showInspiration: s.kind === "character",
  }));
  const { setSharedField, toggleInspiration } = useSheetActions();

  const initStr = initiative >= 0 ? `+${initiative}` : `${initiative}`;
  const profStr = proficiencyBonus >= 0 ? `+${proficiencyBonus}` : `${proficiencyBonus}`;

  const statsGrid = (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 shrink-0 sm:gap-x-4">
      <div className="flex flex-col items-center">
        <div className="cs-score-input w-10 h-6 text-xs flex items-center justify-center">{profStr}</div>
        <span className="cs-label mt-1">Proficiency</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="cs-score-input w-10 h-6 text-xs flex items-center justify-center">{initStr}</div>
        <span className="cs-label mt-1">Initiative</span>
      </div>
      <div className="flex flex-col items-center">
        <NumericInput
          value={speed}
          onChange={(v) => setSharedField("speed", v)}
          min={0}
          defaultValue={30}
          className="cs-score-input w-10 h-6 text-xs"
        />
        <span className="cs-label mt-1">Speed</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="cs-score-input w-10 h-6 text-xs flex items-center justify-center">{passivePerception}</div>
        <span className="cs-label mt-1">Passive Perc.</span>
      </div>
    </div>
  );

  const sizeSelect = (
    <select
      value={size}
      onChange={(e) => setSharedField("size", e.target.value)}
      className="cs-select cs-select-lg text-sm max-w-45 w-full text-center"
    >
      <option value="Tiny">Tiny</option>
      <option value="Small">Small</option>
      <option value="Medium">Medium</option>
      <option value="Large">Large</option>
      <option value="Huge">Huge</option>
      <option value="Gargantuan">Gargantuan</option>
    </select>
  );

  const inspirationToggle = (
    <div onClick={toggleInspiration} className={`flex items-center gap-2 cs-inspiration max-w-45 w-full ${hasInspiration ? "active" : ""}`}>
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
          hasInspiration ? "border-gold bg-gold/20" : "border-rule bg-transparent"
        }`}
      >
        {hasInspiration && <span className="text-xs text-gold">&#10022;</span>}
      </div>
      <span
        className={`text-[10px] uppercase tracking-[0.12em] font-fantasy truncate ${
          hasInspiration ? "text-gold" : "text-faint"
        }`}
      >
        Heroic Inspiration
      </span>
    </div>
  );

  return (
    <div className="cs-section-card p-3 flex gap-3 sm:flex-col overflow-hidden">
      {statsGrid}

      <div className="w-px bg-rule opacity-30 self-stretch sm:w-auto sm:h-px sm:self-auto" />

      <div className="flex flex-col justify-evenly items-center flex-1 min-w-0 gap-2 sm:gap-3">
        {sizeSelect}
        {showInspiration && inspirationToggle}
      </div>
    </div>
  );
};
