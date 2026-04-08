import { useContext } from "react";
import { CharacterSheetContext } from "./CharacterSheetContext";

export const useCharacterSheet = () => {
  const ctx = useContext(CharacterSheetContext);
  if (!ctx) {
    throw new Error(
      "useCharacterSheet must be used inside <CharacterSheetProvider>",
    );
  }
  return ctx;
};
