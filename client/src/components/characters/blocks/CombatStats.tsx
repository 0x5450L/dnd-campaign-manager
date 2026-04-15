import { NumericInput } from "../inputs/NumericInput";

type CombatStatsProps = {
  ac: number;
  initiative: number;
  speed: number;
  size: string;
  proficiencyBonus: number;
  passivePerception: number;
  hasInspiration: boolean;
  onUpdate: (field: string, value: number | string) => void;
  onToggleInspiration: () => void;
};

export const CombatStats = ({
  initiative,
  speed,
  size,
  proficiencyBonus,
  passivePerception,
  hasInspiration,
  onUpdate,
  onToggleInspiration,
}: CombatStatsProps) => {
  const initStr = initiative >= 0 ? `+${initiative}` : `${initiative}`;
  const profStr = proficiencyBonus >= 0 ? `+${proficiencyBonus}` : `${proficiencyBonus}`;

  return (
    <div className="cs-section-card p-3 flex flex-col gap-3 w-full sm:w-fit">
      {/* 2x2 grid of combat numbers */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
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
            onChange={(v) => onUpdate("speed", v)}
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

      {/* Divider */}
      <div className="h-px bg-rule opacity-30" />

      {/* Size — full width, no label */}
      <select
        value={size}
        onChange={(e) => onUpdate("size", e.target.value)}
        className="cs-select cs-select-lg text-sm w-full text-center"
      >
        <option value="Tiny">Tiny</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
        <option value="Huge">Huge</option>
        <option value="Gargantuan">Gargantuan</option>
      </select>

      {/* Inspiration — full width, compact */}
      <div
        onClick={onToggleInspiration}
        className={`cs-inspiration w-full ${hasInspiration ? "active" : ""}`}
      >
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            hasInspiration
              ? "border-gold bg-gold/20"
              : "border-rule bg-transparent"
          }`}
        >
          {hasInspiration && <span className="text-xs text-gold">&#10022;</span>}
        </div>
        <span
          className={`text-[10px] uppercase tracking-[0.12em] font-fantasy ${
            hasInspiration ? "text-gold" : "text-faint"
          }`}
        >
          Heroic Inspiration
        </span>
      </div>
    </div>
  );
};
