import { SimpleInfoInput } from "../inputs/SimpleInfoInput";
import { NumericInput } from "../inputs/NumericInput";

type CharacterHeaderProps = {
  name: string;
  race: string;
  characterClass: string;
  level: number;
  background: string;
  subclass: string;
  xp: number;
  ac: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hpSpent: number;
  hitDiceType: string;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  onUpdate: (field: string, value: string | number) => void;
};

export const CharacterHeader = ({
  name, race, characterClass, level, background, subclass, xp,
  ac, currentHp, maxHp, tempHp, hpSpent,
  hitDiceType, deathSaveSuccesses, deathSaveFailures,
  onUpdate,
}: CharacterHeaderProps) => {

  const renderDots = (count: number, max: number, activeColor: string, field: string) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          onClick={() => onUpdate(field, i < count ? i : i + 1)}
          className={`w-2.5 h-2.5 rounded-full border cursor-pointer transition-colors
            ${i < count ? `${activeColor} border-transparent` : "border-gray-500 hover:border-gray-300"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="flex items-stretch gap-0 border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50">

      {/* Left — Character Info */}
      <div className="flex flex-col justify-center gap-0 p-2 min-w-[240px] border-r border-gray-700">
        <div className="border-b border-gray-600 pb-1 mb-1">
          <SimpleInfoInput label="Character Name" value={name} onChange={(v) => onUpdate("name", v)} labelAlign="left" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0">
          <SimpleInfoInput label="Background" value={background} onChange={(v) => onUpdate("background", v)} labelAlign="left" />
          <SimpleInfoInput label="Class" value={characterClass} onChange={(v) => onUpdate("characterClass", v)} labelAlign="left" />
          <SimpleInfoInput label="Race" value={race} onChange={(v) => onUpdate("race", v)} labelAlign="left" />
          <SimpleInfoInput label="Subclass" value={subclass} onChange={(v) => onUpdate("subclass", v)} labelAlign="left" />
        </div>
      </div>

      {/* Center — Level & XP */}
      <div className="flex flex-col items-center justify-center px-4 border-r border-gray-700 min-w-[90px]">
        <span className="text-gray-500 text-[9px] uppercase tracking-wider">Level</span>
        <NumericInput
          value={level}
          onChange={(v) => onUpdate("level", v)}
          min={1}
          max={20}
          defaultValue={1}
          className="border-2 border-gray-500 rounded-full w-12 h-12 text-amber-400 text-xl font-bold focus:border-amber-400"
        />
        <NumericInput
          value={xp}
          onChange={(v) => onUpdate("xp", v)}
          min={0}
          defaultValue={0}
          className="text-gray-400 text-[11px] w-14 mt-0.5"
        />
        <span className="text-gray-600 text-[8px] uppercase tracking-wider">XP</span>
      </div>

      {/* AC Shield */}
      <div className="flex flex-col items-center justify-center px-3 border-r border-gray-700 min-w-[70px]">
        <span className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">AC</span>
        <div className="w-11 h-13 border-2 border-gray-500 rounded-t-lg rounded-b-[50%] flex items-center justify-center">
          <NumericInput
            value={ac}
            onChange={(v) => onUpdate("ac", v)}
            min={0}
            max={30}
            defaultValue={10}
            className="text-gray-200 text-lg font-bold w-8"
          />
        </div>
        <span className="text-gray-600 text-[8px] uppercase tracking-wider mt-0.5">Shield</span>
      </div>

      {/* Hit Points */}
      <div className="flex flex-col items-center justify-center px-3 border-r border-gray-700 min-w-[160px]">
        <span className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">Hit Points</span>
        <div className="flex items-end gap-1.5">
          <div className="flex flex-col items-center">
            <NumericInput
              value={currentHp}
              onChange={(v) => onUpdate("currentHp", v)}
              defaultValue={0}
              className="border border-gray-600 rounded text-gray-200 text-sm w-10 h-7 focus:border-amber-500"
            />
            <span className="text-gray-600 text-[7px] uppercase">Current</span>
          </div>
          <div className="flex flex-col items-center">
            <NumericInput
              value={tempHp}
              onChange={(v) => onUpdate("tempHp", v)}
              min={0}
              defaultValue={0}
              className="border border-gray-600 rounded text-gray-200 text-sm w-10 h-7 focus:border-amber-500"
            />
            <span className="text-gray-600 text-[7px] uppercase">Temp</span>
          </div>
          <div className="flex flex-col items-center">
            <NumericInput
              value={maxHp}
              onChange={(v) => onUpdate("maxHp", v)}
              min={0}
              defaultValue={0}
              className="border border-gray-600 rounded text-gray-200 text-sm w-10 h-7 focus:border-amber-500"
            />
            <span className="text-gray-600 text-[7px] uppercase">Maximum</span>
          </div>
        </div>
      </div>

      {/* Hit Dice */}
      <div className="flex flex-col items-center justify-center px-3 border-r border-gray-700 min-w-[80px]">
        <span className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">Hit Dice</span>
        <div className="flex items-center gap-1">
          <span className="text-gray-200 text-sm font-medium">{level}</span>
          <select
            value={hitDiceType}
            onChange={(e) => onUpdate("hitDiceType", e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded text-gray-200 text-xs p-0.5 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="d6">d6</option>
            <option value="d8">d8</option>
            <option value="d10">d10</option>
            <option value="d12">d12</option>
          </select>
        </div>
        <NumericInput
          value={hpSpent}
          onChange={(v) => onUpdate("hpSpent", v)}
          min={0}
          max={level}
          defaultValue={0}
          className="border border-gray-600 rounded text-gray-400 text-xs w-8 h-5 focus:border-amber-500 mt-0.5"
        />
        <span className="text-gray-600 text-[7px] uppercase">Spent</span>
      </div>

      {/* Death Saves */}
      <div className="flex flex-col items-center justify-center px-3 min-w-[85px]">
        <span className="text-gray-500 text-[9px] uppercase tracking-wider mb-1.5">Death Saves</span>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-green-400 w-8">Pass</span>
            {renderDots(deathSaveSuccesses, 3, "bg-green-500", "deathSaveSuccesses")}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-red-400 w-8">Fail</span>
            {renderDots(deathSaveFailures, 3, "bg-red-500", "deathSaveFailures")}
          </div>
        </div>
      </div>
    </div>
  );
};
