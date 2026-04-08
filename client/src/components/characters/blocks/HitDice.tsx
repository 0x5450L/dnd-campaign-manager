import { NumericInput } from "../inputs/NumericInput";

type HitDiceProps = {
  hitDiceType: string;
  hitDiceTotal: number;
  hitDiceUsed: number;
  onUpdate: (field: string, value: number | string) => void;
};

export const HitDice = ({ hitDiceType, hitDiceTotal, hitDiceUsed, onUpdate }: HitDiceProps) => {
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-3">
      <div className="cs-section-title">Hit Dice</div>
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-500 text-[10px]">Type</span>
          <select
            value={hitDiceType}
            onChange={(e) => onUpdate("hitDiceType", e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm p-1 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="d6">d6</option>
            <option value="d8">d8</option>
            <option value="d10">d10</option>
            <option value="d12">d12</option>
          </select>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-500 text-[10px]">Total</span>
          <span className="text-gray-200 text-sm font-medium">{hitDiceTotal}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-500 text-[10px]">Used</span>
          <NumericInput
            value={hitDiceUsed}
            onChange={(v) => onUpdate("hitDiceUsed", v)}
            min={0}
            max={hitDiceTotal}
            defaultValue={0}
            className="border border-gray-600 rounded text-gray-200 text-sm p-1 w-10 focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
