import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

type CheckVariant = "success" | "fail";

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

  const renderChecks = (
    count: number,
    max: number,
    variant: CheckVariant,
    field: "deathSaveSuccesses" | "deathSaveFailures",
    label: string,
  ) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] font-fantasy text-faint">
        {label}
      </span>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => {
          const active = i < count;
          return (
            <div
              key={i}
              onClick={() => handleClick(field, count, i)}
              className={`cs-death-check ${active ? variant : ""}`}
            >
              {active && <span className="text-sm">&#10022;</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="cs-section-card flex flex-col p-3 justify-between flex-1">
      <div className="cs-section-title">Death Saves</div>

      {renderChecks(successes, 3, "success", "deathSaveSuccesses", "Successes")}
      {renderChecks(failures, 3, "fail", "deathSaveFailures", "Failures")}
    </div>
  );
};
