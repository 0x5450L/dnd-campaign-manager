import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

export const DeathSaves = () => {
  const { state, setField } = useCharacterSheet();
  const { deathSaveSuccesses: successes, deathSaveFailures: failures } = state;

  const handleClick = (
    field: "deathSaveSuccesses" | "deathSaveFailures",
    count: number,
    i: number,
  ) => {
    setField(field, i < count ? i : i + 1);
  };

  const renderDots = (
    count: number,
    max: number,
    activeColor: string,
    field: "deathSaveSuccesses" | "deathSaveFailures",
  ) => (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          onClick={() => handleClick(field, count, i)}
          className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-colors
            ${
              i < count
                ? `${activeColor} border-transparent`
                : "border-gray-600 hover:border-gray-400"
            }`}
        />
      ))}
    </div>
  );

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-3">
      <div className="text-center text-[10px] uppercase tracking-wider text-gray-500 mb-2">
        Death Saves
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-green-400 text-xs">Successes</span>
          {renderDots(successes, 3, "bg-green-500", "deathSaveSuccesses")}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-red-400 text-xs">Failures</span>
          {renderDots(failures, 3, "bg-red-500", "deathSaveFailures")}
        </div>
      </div>
    </div>
  );
};
