import { TextBlock } from "../../shared/inputs/TextBlock";
import { useCharacterSheet, useSheetActions } from "../../../../state/sheet";

export const Feats = () => {
  const feats = useCharacterSheet((s) => s.feats);
  const { setCharacterField } = useSheetActions();

  return (
    <TextBlock title="Feats" value={feats} onChange={(v) => setCharacterField("feats", v)} />
  );
};
