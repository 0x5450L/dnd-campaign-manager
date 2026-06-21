import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";
import { SpellSlotsTracker } from "../../spells/SpellSlotsTracker";

export const SpellSlots = () => {
  const { state, setField } = useCharacterSheet();

  return (
    <SpellSlotsTracker
      slots={state.spellSlots}
      editable
      onChange={(spellSlots) => setField("spellSlots", spellSlots)}
    />
  );
};
