import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Character, CharacterType } from "../../../../../types/characters/characters";
import { CharacterSheet } from "../../../../characters/CharacterSheet";
import {
  useCampaignCharactersQuery,
  useCharactersRealtimeSync,
  useDeleteCharacterMutation,
} from "../../../../../queries/characters";
import ConfirmDialog from "../../../../ui/ConfirmDialog";
import CharactersSidebar from "../CharactersSidebar";
import { CampaignCharactersContext } from "./CampaignCharactersContext";

type SheetMode =
  | { kind: "closed" }
  | { kind: "edit"; characterId: string }
  | { kind: "create"; type: CharacterType };

type CampaignCharactersControllerProps = {
  campaignId: string;
  dmId: string;
  currentUserId: string | null;
  children: ReactNode;
};

const EMPTY_CHARACTERS: Character[] = [];

function CampaignCharactersController({
  campaignId,
  dmId,
  currentUserId,
  children,
}: CampaignCharactersControllerProps) {
  const { data: characters = EMPTY_CHARACTERS } = useCampaignCharactersQuery(campaignId);
  useCharactersRealtimeSync(campaignId);
  const deleteCharacterMutation = useDeleteCharacterMutation();

  const [sheetMode, setSheetMode] = useState<SheetMode>({ kind: "closed" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  const isDM = currentUserId !== null && currentUserId === dmId;

  const myCharacter = useMemo(
    () =>
      currentUserId
        ? characters.find((c) => c.userId === currentUserId && c.type === "player") ?? null
        : null,
    [characters, currentUserId],
  );

  const openCharactersSidebar = useCallback(() => setIsSidebarOpen(true), []);

  const openMyCharacter = useCallback(() => {
    if (myCharacter) {
      setSheetMode({ kind: "edit", characterId: myCharacter.id });
    } else {
      setSheetMode({ kind: "create", type: "player" });
    }
  }, [myCharacter]);

  const handleOpenCharacterFromSidebar = (character: Character) => {
    setSheetMode({ kind: "edit", characterId: character.id });
  };

  const handleCreateNpc = () => {
    setSheetMode({ kind: "create", type: "npc" });
  };

  const handleConfirmDeleteCharacter = () => {
    if (!characterToDelete) return;
    const target = characterToDelete;
    setCharacterToDelete(null);
    deleteCharacterMutation.mutate(target.id, {
      onError: (error) => console.error("Error deleting character:", error),
    });
  };

  const contextValue = useMemo(
    () => ({
      characters,
      myCharacter,
      isDM,
      openCharactersSidebar,
      openMyCharacter,
    }),
    [characters, myCharacter, isDM, openCharactersSidebar, openMyCharacter],
  );

  return (
    <CampaignCharactersContext.Provider value={contextValue}>
      {children}

      {isDM && (
        <CharactersSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          characters={characters}
          dmId={dmId}
          onOpenCharacter={handleOpenCharacterFromSidebar}
          onCreateNpc={handleCreateNpc}
          onDeleteCharacter={(c) => setCharacterToDelete(c)}
        />
      )}

      {characterToDelete && (
        <ConfirmDialog
          title="Delete character"
          message={`Are you sure you want to delete "${characterToDelete.name || "this character"}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDeleteCharacter}
          onCancel={() => setCharacterToDelete(null)}
        />
      )}

      <CharacterSheet
        isOpen={sheetMode.kind !== "closed"}
        characterId={sheetMode.kind === "edit" ? sheetMode.characterId : undefined}
        defaultType={sheetMode.kind === "create" ? sheetMode.type : "player"}
        campaignId={campaignId}
        onCreated={(id) => setSheetMode({ kind: "edit", characterId: id })}
        onClose={() => setSheetMode({ kind: "closed" })}
      />
    </CampaignCharactersContext.Provider>
  );
}

export default CampaignCharactersController;
