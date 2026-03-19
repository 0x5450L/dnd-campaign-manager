import { StatInput } from "../inputs/StatInput";

type CombatStatsProps = {
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  passivePerception: number;
  onUpdate: (field: string, value: number) => void;
};

export const CombatStats = ({
  ac, initiative, speed, proficiencyBonus, passivePerception, onUpdate,
}: CombatStatsProps) => {
  const initStr = initiative >= 0 ? `+${initiative}` : `${initiative}`;
  const profStr = proficiencyBonus >= 0 ? `+${proficiencyBonus}` : `${proficiencyBonus}`;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-col items-center gap-0.5 border border-gray-700 rounded-lg bg-gray-800/30 p-2 min-w-[60px]">
        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Prof. Bonus</span>
        <span className="text-amber-400 text-lg font-bold">{profStr}</span>
      </div>
      <StatInput label="AC" value={ac} onChange={(v) => onUpdate("ac", v)} min={0} max={30} />
      <div className="flex flex-col items-center gap-0.5 border border-gray-700 rounded-lg bg-gray-800/30 p-2 min-w-[60px]">
        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Initiative</span>
        <span className="text-gray-200 text-sm font-medium">{initStr}</span>
      </div>
      <StatInput label="Speed" value={speed} onChange={(v) => onUpdate("speed", v)} min={0} />
      <div className="flex flex-col items-center gap-0.5 border border-gray-700 rounded-lg bg-gray-800/30 p-2 min-w-[60px]">
        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Passive Perc.</span>
        <span className="text-gray-200 text-sm font-medium">{passivePerception}</span>
      </div>
    </div>
  );
};
