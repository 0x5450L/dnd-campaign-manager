import { StatInput } from "../inputs/StatInput";

type HitPointsProps = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  onUpdate: (field: string, value: number) => void;
};

export const HitPoints = ({ currentHp, maxHp, tempHp, onUpdate }: HitPointsProps) => {
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-3">
      <div className="text-center text-[10px] uppercase tracking-wider text-gray-500 mb-2">Hit Points</div>
      <div className="flex items-center justify-center gap-4">
        <StatInput label="Current" value={currentHp} onChange={(v) => onUpdate("currentHp", v)} />
        <span className="text-gray-600 text-lg">/</span>
        <StatInput label="Maximum" value={maxHp} onChange={(v) => onUpdate("maxHp", v)} min={0} />
        <div className="border-l border-gray-700 pl-4">
          <StatInput label="Temp" value={tempHp} onChange={(v) => onUpdate("tempHp", v)} min={0} />
        </div>
      </div>
    </div>
  );
};
