import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Character, CharacterType } from "../../../../../types/characters/characters";
import { CharacterSheet } from "../../../../characters/CharacterSheet";
import { useSSE } from "../../../../../hooks/useSSE";
import { deleteCharacter, getCampaignCharacters } from "../../../../../services/api/characters";
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

function CampaignCharactersController({
  campaignId,
  dmId,
  currentUserId,
  children,
}: CampaignCharactersControllerProps) {
  const { subscribe } = useSSE();
  const [characters, setCharacters] = useState<Character[]>([]);
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

  const refetchCharacters = useCallback(() => {
    getCampaignCharacters(campaignId)
      .then((res) => setCharacters(res.characters))
      .catch((error) => console.error("Error fetching characters:", error));
  }, [campaignId]);

  useEffect(() => {
    refetchCharacters();
  }, [refetchCharacters]);

  useEffect(() => {
    const matchesCampaign = (data: unknown) =>
      (data as { campaignId?: string }).campaignId === campaignId;

    const unsubCreated = subscribe("character_created", (data) => {
      if (matchesCampaign(data)) refetchCharacters();
    });
    const unsubUpdated = subscribe("character_updated", (data) => {
      if (matchesCampaign(data)) refetchCharacters();
    });
    const unsubDeleted = subscribe("character_deleted", (data) => {
      if (!matchesCampaign(data)) return;
      const { characterId } = data as { characterId: string };
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [campaignId, subscribe, refetchCharacters]);

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

  const handleCharacterSaved = (saved: Character) => {
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
    });
  };

  const handleConfirmDeleteCharacter = async () => {
    if (!characterToDelete) return;
    const target = characterToDelete;
    setCharacterToDelete(null);
    try {
      await deleteCharacter(target.id);
      setCharacters((prev) => prev.filter((c) => c.id !== target.id));
    } catch (error) {
      console.error("Error deleting character:", error);
    }
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
        onSaved={handleCharacterSaved}
        onClose={() => setSheetMode({ kind: "closed" })}
      />
    </CampaignCharactersContext.Provider>
  );
}

export default CampaignCharactersController;
