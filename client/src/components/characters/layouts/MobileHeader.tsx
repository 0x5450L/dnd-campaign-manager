import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

export const MobileHeader = () => {
  const { state } = useCharacterSheet();

  const classInfo = [state.characterClass, state.subclass]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="sticky top-0 z-20 px-4 py-2.5 bg-bg border-b border-rule">
      <div className="truncate text-sm font-bold font-fantasy text-gold">
        {state.name || "New Character"}
      </div>
      <div className="text-[11px] text-dim truncate">
        {classInfo || "—"}{" "}
        <span className="text-faint">Lv.{state.level}</span>
        {state.background && (
          <span className="text-faint"> · {state.background}</span>
        )}
      </div>
    </div>
  );
};
