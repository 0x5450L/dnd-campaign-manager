import { CharacterSheetProvider } from "../../context/characterSheetContext/CharacterSheetProvider";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { MobileCharacterSheet } from "./layouts/MobileCharacterSheet";
import { DesktopCharacterSheet } from "./layouts/DesktopCharacterSheet";

const CharacterSheetInner = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileCharacterSheet /> : <DesktopCharacterSheet />;
};

export const CharacterSheet = () => (
  <CharacterSheetProvider>
    <CharacterSheetInner />
  </CharacterSheetProvider>
);
