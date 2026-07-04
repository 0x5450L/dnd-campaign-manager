import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { MobileCharacterSheet } from "./character/MobileCharacterSheet";
import { DesktopCharacterSheet } from "./character/DesktopCharacterSheet";
import { MobileCreatureSheet } from "./creature/MobileCreatureSheet";
import { DesktopCreatureSheet } from "./creature/DesktopCreatureSheet";
import {
  useActiveSheetId,
  useSheetActions,
  useSheetStore,
} from "../../state/sheet";
import { createInitialSheetState } from "../../constants/characterSheet";
import type { SheetState } from "../../types/characters/characterSheet";
import type { CharacterType } from "../../types/characters/characters";
import {
  useCharacterQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
} from "../../queries/characters";
import {
  dtoToSheetState,
  sheetKindFromCharacterType,
  sheetStateToCreatePayload,
  sheetStateToUpdatePayload,
} from "../../utils/characterSheetMapping";
import { StatusChip, type StatusChipState } from "../ui/StatusChip";

const DRAFT_SHEET_ID = "draft";

type CharacterSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  characterId?: string;
  campaignId: string;
  defaultType?: CharacterType;
  seedState?: SheetState;
  onCreated?: (id: string) => void;
};

const CharacterSheetInner = ({
  sheetType,
  onClose,
  onForceSave,
}: {
  sheetType: CharacterType;
  onClose: () => void;
  onForceSave?: () => void;
}) => {
  const isMobile = useIsMobile();

  if (sheetType === "monster") {
    return isMobile ? (
      <MobileCreatureSheet onClose={onClose} onForceSave={onForceSave} />
    ) : (
      <DesktopCreatureSheet />
    );
  }

  return isMobile ? (
    <MobileCharacterSheet onClose={onClose} onForceSave={onForceSave} />
  ) : (
    <DesktopCharacterSheet />
  );
};

const SheetTopActions = ({
  onClose,
  onForceSave,
  saveStatus,
  onDismissStatus,
}: {
  onClose: () => void;
  onForceSave?: () => void;
  saveStatus: StatusChipState;
  onDismissStatus: () => void;
}) => (
  <div className="fixed top-3 right-3 z-21 hidden items-center gap-2 sm:flex">
    <StatusChip state={saveStatus} onDismiss={onDismissStatus} />
    {onForceSave && (
      <button
        type="button"
        onClick={onForceSave}
        aria-label="Save character sheet"
        className="w-10 h-10 rounded-full bg-gold-dim/90 hover:bg-gold-dim text-gold-bright border border-gold cursor-pointer transition-colors duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 10l3 3 7-7" />
        </svg>
      </button>
    )}
    <button
      type="button"
      onClick={onClose}
      aria-label="Close character sheet"
      className="w-10 h-10 rounded-full bg-surface/90 hover:bg-surface-light text-ink border border-rule cursor-pointer transition-colors duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </div>
);

export const CharacterSheet = ({
  isOpen,
  onClose,
  characterId,
  campaignId,
  defaultType = "player",
  seedState,
  onCreated,
}: CharacterSheetProps) => {
  const { data: loadedCharacter, isLoading, error } = useCharacterQuery(characterId);
  const sheetType: CharacterType = loadedCharacter?.type ?? defaultType;
  const createCharacterMutation = useCreateCharacterMutation();
  const updateCharacterMutation = useUpdateCharacterMutation();
  const [saveStatus, setSaveStatus] = useState<StatusChipState>({ status: "idle" });

  const { openSheet, closeSheet } = useSheetActions();
  const activeSheetId = useActiveSheetId();
  const expectedSheetId = characterId ?? DRAFT_SHEET_ID;

  useEffect(() => {
    if (!isOpen) return;
    if (characterId) {
      if (loadedCharacter) {
        openSheet(loadedCharacter.id, dtoToSheetState(loadedCharacter), true);
      }
      return;
    }
    openSheet(
      DRAFT_SHEET_ID,
      seedState ?? createInitialSheetState(sheetKindFromCharacterType(defaultType)),
      false,
    );
  }, [isOpen, characterId, loadedCharacter, seedState, defaultType, openSheet]);

  useEffect(() => {
    if (!isOpen) return;
    return () => closeSheet();
  }, [isOpen, closeSheet]);

  const handleClose = useCallback(() => {
    setSaveStatus({ status: "idle" });
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  const handleSaveError = (err: unknown) => {
    console.error("Error saving character:", err);
    const message = err instanceof Error ? err.message : "Save failed";
    setSaveStatus({ status: "error", message });
  };

  const handleSave = () => {
    const state = useSheetStore.getState().state;
    if (loadedCharacter) {
      updateCharacterMutation.mutate(
        { id: loadedCharacter.id, payload: sheetStateToUpdatePayload(state) },
        {
          onSuccess: () => setSaveStatus({ status: "success" }),
          onError: handleSaveError,
        },
      );
    } else {
      createCharacterMutation.mutate(sheetStateToCreatePayload(state, campaignId, defaultType), {
        onSuccess: (character) => {
          updateCharacterMutation.mutate(
            { id: character.id, payload: sheetStateToUpdatePayload(state) },
            {
              onSuccess: () => {
                setSaveStatus({ status: "success" });
                onCreated?.(character.id);
              },
              onError: handleSaveError,
            },
          );
        },
        onError: handleSaveError,
      });
    }
  };

  const dismissStatus = () => setSaveStatus({ status: "idle" });

  if (!isOpen) return null;

  const sheetReady = activeSheetId === expectedSheetId;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="Character sheet"
      onClick={handleClose}
    >
      <div
        className="relative min-h-full w-full bg-bg"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-rust">
            <p>Failed to load character.</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded bg-surface text-ink hover:bg-surface-light"
            >
              Close
            </button>
          </div>
        ) : isLoading || !sheetReady ? (
          <div className="flex items-center justify-center min-h-[50vh] text-gold">
            Loading character...
          </div>
        ) : (
          <>
            <SheetTopActions
              onClose={handleClose}
              onForceSave={handleSave}
              saveStatus={saveStatus}
              onDismissStatus={dismissStatus}
            />
            <CharacterSheetInner sheetType={sheetType} onClose={handleClose} onForceSave={handleSave} />
          </>
        )}
      </div>
    </div>
  );
};
