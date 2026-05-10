import type { Character, CharacterType } from "../../../../types/characters/characters";

type CharacterCardProps = {
  character: Character;
  isOwnedByDm: boolean;
  onOpen: (character: Character) => void;
  onDelete: (character: Character) => void;
};

const typeChipStyles: Record<CharacterType, string> = {
  player: "bg-blue-600/20 text-blue-300 border-blue-700/40",
  npc: "bg-amber-600/20 text-amber-300 border-amber-700/40",
  monster: "bg-red-600/20 text-red-300 border-red-700/40",
};

const typeLabel: Record<CharacterType, string> = {
  player: "PC",
  npc: "NPC",
  monster: "Monster",
};

const getHpBarColor = (ratio: number) => {
  if (ratio >= 0.66) return "bg-green-500";
  if (ratio >= 0.33) return "bg-amber-500";
  return "bg-red-500";
};

function CharacterCard({ character, isOwnedByDm, onOpen, onDelete }: CharacterCardProps) {
  const hpRatio = character.maxHp > 0 ? Math.max(0, Math.min(1, character.currentHp / character.maxHp)) : 0;
  const ownerLabel = isOwnedByDm ? "DM" : character.user?.displayName ?? "—";

  const handleOpen = () => onOpen(character);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(character);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
      className="group w-full text-left bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-amber-700/50 rounded-xl p-4 transition-colors duration-200 cursor-pointer flex flex-col gap-3 focus:outline-none focus:ring-2 focus:ring-amber-600/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-amber-300 truncate">
              {character.name || "Unnamed"}
            </h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${typeChipStyles[character.type]}`}
            >
              {typeLabel[character.type]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {character.race || "—"}
            {character.characterClass ? ` · ${character.characterClass}` : ""}
          </p>
        </div>

        <button
          type="button"
          aria-label={`Delete ${character.name}`}
          onClick={handleDelete}
          className="shrink-0 w-8 h-8 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-900/20 flex items-center justify-center transition-colors duration-150 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">HP</span>
          <span className="text-gray-300 tabular-nums">
            {character.currentHp}
            <span className="text-gray-500"> / {character.maxHp || "—"}</span>
            {character.tempHp > 0 && (
              <span className="text-blue-300"> +{character.tempHp}</span>
            )}
          </span>
        </div>
        <div className="h-1.5 bg-gray-900/60 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getHpBarColor(hpRatio)}`}
            style={{ width: `${hpRatio * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-gray-300 font-medium tabular-nums">AC {character.armorClass}</span>
        </div>
        <span className="text-gray-500 truncate max-w-[55%]" title={ownerLabel}>
          {ownerLabel}
        </span>
      </div>
    </div>
  );
}

export default CharacterCard;
