import { useEffect, useMemo, useState } from "react";
import type { Character } from "../../../../types/characters/characters";
import CommonButton from "../../../ui/buttons/CommonButton";
import CharacterCard from "./CharacterCard";
import CharactersEmptyState from "./CharactersEmptyState";

type CharactersSidebarTab = "players" | "npcs";

type CharactersSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  dmId: string;
  onOpenCharacter: (character: Character) => void;
  onCreateNpc: () => void;
  onDeleteCharacter: (character: Character) => void;
};

function CharactersSidebar({
  isOpen,
  onClose,
  characters,
  dmId,
  onOpenCharacter,
  onCreateNpc,
  onDeleteCharacter,
}: CharactersSidebarProps) {
  const [activeTab, setActiveTab] = useState<CharactersSidebarTab>("players");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const { players, npcs } = useMemo(() => {
    const players: Character[] = [];
    const npcs: Character[] = [];
    for (const c of characters) {
      if (c.type === "player") players.push(c);
      else npcs.push(c);
    }
    return { players, npcs };
  }, [characters]);

  const visibleList = activeTab === "players" ? players : npcs;

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Campaign characters"
        className={`fixed top-0 right-0 h-full z-40 w-full sm:w-[420px] bg-bg border-l border-gray-700 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-amber-300">Characters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close characters sidebar"
            className="w-9 h-9 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 flex items-center justify-center cursor-pointer transition-colors duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </header>

        <div role="tablist" aria-label="Character groups" className="flex border-b border-gray-700 shrink-0">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "players"}
            onClick={() => setActiveTab("players")}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer border-b-2 ${
              activeTab === "players"
                ? "text-amber-300 border-amber-500"
                : "text-gray-400 hover:text-gray-200 border-transparent"
            }`}
          >
            Players
            <span className="ml-1.5 text-xs text-gray-500">({players.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "npcs"}
            onClick={() => setActiveTab("npcs")}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer border-b-2 ${
              activeTab === "npcs"
                ? "text-amber-300 border-amber-500"
                : "text-gray-400 hover:text-gray-200 border-transparent"
            }`}
          >
            NPCs
            <span className="ml-1.5 text-xs text-gray-500">({npcs.length})</span>
          </button>
        </div>

        {activeTab === "npcs" && (
          <div className="px-4 pt-3 shrink-0">
            <CommonButton onClick={onCreateNpc} size="sm" className="w-full">
              + New NPC
            </CommonButton>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {visibleList.length === 0 ? (
            <CharactersEmptyState
              message={
                activeTab === "players"
                  ? "No player characters yet. Players will see them here once created."
                  : "No NPCs yet. Create one to populate your world."
              }
            />
          ) : (
            visibleList.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isOwnedByDm={character.userId === dmId}
                onOpen={onOpenCharacter}
                onDelete={onDeleteCharacter}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

export default CharactersSidebar;
