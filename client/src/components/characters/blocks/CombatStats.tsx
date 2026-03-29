import { NumericInput } from "../inputs/NumericInput";

type CombatStatsProps = {
  ac: number;
  initiative: number;
  speed: number;
  size: string;
  proficiencyBonus: number;
  passivePerception: number;
  onUpdate: (field: string, value: number | string) => void;
};

export const CombatStats = ({
  initiative, speed, size, proficiencyBonus, passivePerception, onUpdate,
}: CombatStatsProps) => {
  const initStr = initiative >= 0 ? `+${initiative}` : `${initiative}`;
  const profStr = proficiencyBonus >= 0 ? `+${proficiencyBonus}` : `${proficiencyBonus}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Proficiency Bonus */}
      <div className="cs-ornate-frame p-2 flex flex-col items-center min-w-[72px]">
        <span className="cs-label">Prof. Bonus</span>
        <span className="cs-fantasy-header text-xl mt-1">{profStr}</span>
      </div>

      {/* Initiative */}
      <div className="cs-stat-box">
        <span className="cs-label">Initiative</span>
        <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{initStr}</span>
      </div>

      {/* Speed */}
      <div className="cs-stat-box">
        <span className="cs-label">Speed</span>
        <NumericInput
          value={speed}
          onChange={(v) => onUpdate("speed", v)}
          min={0} defaultValue={30}
          className="cs-score-input w-12 h-7 text-sm"
        />
      </div>

      {/* Size */}
      <div className="cs-stat-box">
        <span className="cs-label">Size</span>
        <select
          value={size}
          onChange={(e) => onUpdate("size", e.target.value)}
          className="cs-select text-sm"
        >
          <option value="Tiny">Tiny</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
          <option value="Huge">Huge</option>
          <option value="Gargantuan">Gargantuan</option>
        </select>
      </div>

      {/* Passive Perception */}
      <div className="cs-stat-box">
        <span className="cs-label">Passive Perc.</span>
        <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{passivePerception}</span>
      </div>
    </div>
  );
};
