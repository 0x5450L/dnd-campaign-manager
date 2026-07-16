import { TextBlock } from "@/components/sheets/shared/inputs/TextBlock";
import { useCharacterSheet, useSheetActions } from "@/state/sheet";

export const RacialTraits = () => {
  const racialTraits = useCharacterSheet((s) => s.racialTraits);
  const { setCharacterField } = useSheetActions();

  return (
    <TextBlock
      title="Racial Traits"
      value={racialTraits}
      onChange={(v) => setCharacterField("racialTraits", v)}
    />
  );
};
