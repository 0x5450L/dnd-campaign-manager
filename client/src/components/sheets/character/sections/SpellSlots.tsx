import { useCharacterSheet, useSheetActions } from "@/state/sheet";
import { SpellSlotsTracker } from "@/components/spells/SpellSlotsTracker";

export const SpellSlots = () => {
  const spellSlots = useCharacterSheet((s) => s.spellSlots);
  const { setCharacterField } = useSheetActions();

  return (
    <SpellSlotsTracker
      slots={spellSlots}
      editable
      onChange={(spellSlots) => setCharacterField("spellSlots", spellSlots)}
    />
  );
};
