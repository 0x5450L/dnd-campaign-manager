import { useEffect, useMemo, useState } from "react";
import { CharacterSheetProvider } from "../../context/characterSheetContext/CharacterSheetProvider";
import { useCharacterSheet } from "../../context/characterSheetContext/useCharacterSheet";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { MobileCharacterSheet } from "./layouts/MobileCharacterSheet";
import { DesktopCharacterSheet } from "./layouts/DesktopCharacterSheet";
import type { CharacterSheetState } from "../../types/characters/characterSheet";
import type { Character, CharacterType } from "../../types/characters/characters";
import {
  createCharacter,
  getCharacter,
  updateCharacter,
} from "../../services/api/characters";
import {
  dtoToSheetState,
  sheetStateToCreatePayload,
  sheetStateToUpdatePayload,
} from "../../utils/characterSheetMapping";
import { StatusChip, type StatusChipState } from "../ui/StatusChip";

type CharacterSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  characterId?: string;
  campaignId: string;
  defaultType?: CharacterType;
  onSaved?: (character: Character) => void;
};

const CharacterSheetInner = ({
  onClose,
  onForceSave,
}: {
  onClose: () => void;
  onForceSave?: (state: CharacterSheetState) => void;
}) => {
  const isMobile = useIsMobile();
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
  onForceSave?: (state: CharacterSheetState) => void;
  saveStatus: StatusChipState;
  onDismissStatus: () => void;
}) => {
  const { state } = useCharacterSheet();

  return (
    <div className="fixed top-3 right-3 z-21 hidden items-center gap-2 sm:flex">
      <StatusChip state={saveStatus} onDismiss={onDismissStatus} />
      {onForceSave && (
        <button
          type="button"
          onClick={() => onForceSave(state)}
          aria-label="Save character sheet"
          className="w-10 h-10 rounded-full bg-amber-700/90 hover:bg-amber-600 text-amber-50 border border-amber-500 cursor-pointer transition-colors duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
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
        className="w-10 h-10 rounded-full bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-600 cursor-pointer transition-colors duration-200 flex items-center justify-center shadow-lg backdrop-blur-sm"
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
};

export const CharacterSheet = ({
  isOpen,
  onClose,
  characterId,
  campaignId,
  defaultType = "player",
  onSaved,
}: CharacterSheetProps) => {
  const [loadedCharacter, setLoadedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<StatusChipState>({ status: "idle" });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setSaveStatus({ status: "idle" });
    });

    if (!characterId) {
      queueMicrotask(() => {
        if (cancelled) return;
        setLoadedCharacter(null);
        setError(null);
        setIsLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
    });

    getCharacter(characterId)
      .then((res) => {
        if (cancelled) return;
        setLoadedCharacter(res.character);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error loading character:", err);
        setError("Failed to load character.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, characterId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const initialState = useMemo(
    () => (loadedCharacter ? dtoToSheetState(loadedCharacter) : undefined),
    [loadedCharacter],
  );

  const handleSave = async (state: CharacterSheetState) => {
    try {
      const res = loadedCharacter
        ? await updateCharacter(loadedCharacter.id, sheetStateToUpdatePayload(state))
        : await createCharacter(sheetStateToCreatePayload(state, campaignId, defaultType));

      setLoadedCharacter(res.character);
      onSaved?.(res.character);
      setSaveStatus({ status: "success" });
    } catch (err) {
      console.error("Error saving character:", err);
      const message = err instanceof Error ? err.message : "Save failed";
      setSaveStatus({ status: "error", message });
    }
  };

  const dismissStatus = () => setSaveStatus({ status: "idle" });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="Character sheet"
      onClick={onClose}
    >
      <div
        className="relative min-h-full w-full bg-bg"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh] text-amber-400">
            Loading character...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-red-400">
            <p>{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        ) : (
          <CharacterSheetProvider
            key={loadedCharacter?.id ?? "new"}
            initialState={initialState}
          >
            <SheetTopActions
              onClose={onClose}
              onForceSave={handleSave}
              saveStatus={saveStatus}
              onDismissStatus={dismissStatus}
            />
            <CharacterSheetInner onClose={onClose} onForceSave={handleSave} />
          </CharacterSheetProvider>
        )}
      </div>
    </div>
  );
};
