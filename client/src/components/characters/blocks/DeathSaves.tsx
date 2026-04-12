import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

const PLATINUM = {
  border: "#b0c4d8",
  bg: "rgba(176, 196, 216, 0.2)",
  icon: "#c8dcea",
  label: "#b0c4d8",
};

const GRIM = {
  border: "#3a1518",
  bg: "#1a0a0c",
  icon: "#6b2a2a",
  label: "#b0c4d8",
};

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
    palette: typeof PLATINUM,
    field: "deathSaveSuccesses" | "deathSaveFailures",
    label: string,
  ) => (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-[11px] uppercase tracking-[0.1em] font-semibold"
        style={{ fontFamily: "var(--font-fantasy)", color: "var(--color-text-label)" }}
      >
        {label}
      </span>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => {
          const active = i < count;
          return (
            <div
              key={i}
              onClick={() => handleClick(field, count, i)}
              className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer"
              style={{
                borderColor: active ? palette.border : "var(--color-border)",
                background: active ? palette.bg : "transparent",
              }}
            >
              {active && (
                <span style={{ color: palette.icon, fontSize: "14px" }}>
                  &#10022;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="cs-section-card flex flex-col p-3 justify-between flex-1">
      <div className="cs-section-title">Death Saves</div>

      {renderChecks(successes, 3, PLATINUM, "deathSaveSuccesses", "Successes")}
      {renderChecks(failures, 3, GRIM, "deathSaveFailures", "Failures")}
    </div>
  );
};
