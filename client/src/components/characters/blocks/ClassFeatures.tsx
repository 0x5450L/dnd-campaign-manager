import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

export const ClassFeatures = () => {
  const { state, setField } = useCharacterSheet();

  return (
    <div className="cs-section-card p-3 flex flex-col flex-1">
      <div className="cs-section-title">Class Features</div>
      <textarea
        value={state.classFeatures}
        onChange={(e) => setField("classFeatures", e.target.value)}
        className="cs-textarea flex-1 min-h-20"
        placeholder="Class Features..."
      />
    </div>
  );
};
