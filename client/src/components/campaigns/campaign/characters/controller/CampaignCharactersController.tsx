import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Character, CharacterType } from "@/types/characters/characters";
import type { CreatureSheetState } from "@/types/characters/characterSheet";
import type { SrdCreature } from "@shared/dto/srd";
import { srdCreatureToSheetState } from "@/utils/srd/creatureMapper";
import { CharacterSheet } from "@/components/sheets/CharacterSheet";
import {
  useCampaignCharactersQuery,
  useCharactersRealtimeSync,
  useDeleteCharacterMutation,
} from "@/queries/characters";
import { useActiveEncounter } from "@/hooks/liveSession/useActiveEncounter";
import { useNotificationStore } from "@/state/notifications/notificationStore";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CharactersSidebar from "../CharactersSidebar";
import CreatureBrowser from "../CreatureBrowser";
import { CampaignCharactersContext } from "./CampaignCharactersContext";

type SheetMode =
  | { kind: "closed" }
  | { kind: "edit"; characterId: string }
  | { kind: "create"; type: CharacterType }
  | { kind: "preview"; seed: CreatureSheetState };

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
  const { encounter } = useActiveEncounter();
  const notify = useNotificationStore((s) => s.notify);

  const [sheetMode, setSheetMode] = useState<SheetMode>({ kind: "closed" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  const isDM = currentUserId !== null && currentUserId === dmId;
  const isSheetLocked = !isDM && encounter !== null;

  const myCharacter = useMemo(
    () =>
      currentUserId
        ? characters.find((c) => c.userId === currentUserId && c.type === "player") ?? null
        : null,
    [characters, currentUserId],
  );

  const openCharactersSidebar = useCallback(() => setIsSidebarOpen(true), []);

  const openMyCharacter = useCallback(() => {
    if (isSheetLocked) {
      notify("Character sheet is locked during combat — use your participant card.", "info");
      return;
    }
    if (myCharacter) {
      setSheetMode({ kind: "edit", characterId: myCharacter.id });
    } else {
      setSheetMode({ kind: "create", type: "player" });
    }
  }, [isSheetLocked, notify, myCharacter]);

  const [wasLocked, setWasLocked] = useState(isSheetLocked);
  if (wasLocked !== isSheetLocked) {
    setWasLocked(isSheetLocked);
    if (isSheetLocked && sheetMode.kind !== "closed") {
      setSheetMode({ kind: "closed" });
    }
  }

  const lockNotifiedRef = useRef(isSheetLocked);
  useEffect(() => {
    if (isSheetLocked && !lockNotifiedRef.current) {
      lockNotifiedRef.current = true;
      notify("Combat started — character sheet is locked.", "info");
    } else if (!isSheetLocked) {
      lockNotifiedRef.current = false;
    }
  }, [isSheetLocked, notify]);

  const handleOpenCharacterFromSidebar = (character: Character) => {
    setSheetMode({ kind: "edit", characterId: character.id });
  };

  const handleCreateNpc = () => {
    setSheetMode({ kind: "create", type: "npc" });
  };

  const handleOpenBestiary = () => {
    setIsBestiaryOpen(true);
  };

  const handleSelectCreature = (creature: SrdCreature) => {
    setSheetMode({ kind: "preview", seed: srdCreatureToSheetState(creature) });
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
      isSheetLocked,
      openCharactersSidebar,
      openMyCharacter,
    }),
    [characters, myCharacter, isDM, isSheetLocked, openCharactersSidebar, openMyCharacter],
  );

  return (
    <CampaignCharactersContext.Provider value={contextValue}>
      {children}

      {isDM && (
        <>
          <CharactersSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            characters={characters}
            dmId={dmId}
            onOpenCharacter={handleOpenCharacterFromSidebar}
            onCreateNpc={handleCreateNpc}
            onOpenBestiary={handleOpenBestiary}
            onDeleteCharacter={(c) => setCharacterToDelete(c)}
          />

          <CreatureBrowser
            isOpen={isBestiaryOpen}
            onClose={() => setIsBestiaryOpen(false)}
            onSelectCreature={handleSelectCreature}
          />
        </>
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
        defaultType={
          sheetMode.kind === "preview"
            ? "monster"
            : sheetMode.kind === "create"
              ? sheetMode.type
              : "player"
        }
        seedState={sheetMode.kind === "preview" ? sheetMode.seed : undefined}
        campaignId={campaignId}
        onCreated={(id) => setSheetMode({ kind: "edit", characterId: id })}
        onClose={() => setSheetMode({ kind: "closed" })}
      />
    </CampaignCharactersContext.Provider>
  );
}

export default CampaignCharactersController;
