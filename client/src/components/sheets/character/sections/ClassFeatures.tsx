import { useCharacterSheet, useSheetActions } from "../../../../state/sheet";

export const ClassFeatures = () => {
  const classFeatures = useCharacterSheet((s) => s.classFeatures);
  const { setCharacterField } = useSheetActions();

  return (
    <div className="cs-section-card p-3 flex flex-col flex-1">
      <div className="cs-section-title">Class Features</div>
      <textarea
        value={classFeatures}
        onChange={(e) => setCharacterField("classFeatures", e.target.value)}
        className="cs-textarea flex-1 min-h-20"
        placeholder="Class Features..."
      />
    </div>
  );
};
