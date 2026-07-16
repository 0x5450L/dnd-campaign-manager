import type { Character, CharacterType } from "@/types/characters/characters";

type CharacterCardProps = {
  character: Character;
  isOwnedByDm: boolean;
  onOpen: (character: Character) => void;
  onDelete: (character: Character) => void;
};

const typeChipStyles: Record<CharacterType, string> = {
  player: "bg-frost/20 text-frost-soft border-frost/40",
  npc: "bg-gold-dim/20 text-gold-bright border-gold-dim/40",
  monster: "bg-rust/20 text-rust-soft border-rust/40",
};

const typeLabel: Record<CharacterType, string> = {
  player: "PC",
  npc: "NPC",
  monster: "Monster",
};

const getHpBarColor = (ratio: number) => {
  if (ratio >= 0.66) return "bg-leaf";
  if (ratio >= 0.33) return "bg-gold";
  return "bg-rust";
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
      className="group w-full text-left bg-surface/50 hover:bg-surface-light/50 border border-rule hover:border-gold-dim/50 rounded-xl p-4 transition-colors duration-200 cursor-pointer flex flex-col gap-3 focus:outline-none focus:ring-2 focus:ring-gold-dim/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gold-bright truncate">
              {character.name || "Unnamed"}
            </h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${typeChipStyles[character.type]}`}
            >
              {typeLabel[character.type]}
            </span>
          </div>
          <p className="text-xs text-dim mt-0.5 truncate">
            {character.race || "—"}
            {character.characterClass ? ` · ${character.characterClass}` : ""}
          </p>
        </div>

        <button
          type="button"
          aria-label={`Delete ${character.name}`}
          onClick={handleDelete}
          className="shrink-0 w-8 h-8 rounded-md text-faint hover:text-rust hover:bg-rust/20 flex items-center justify-center transition-colors duration-150 cursor-pointer"
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
          <span className="text-dim font-medium">HP</span>
          <span className="text-dim tabular-nums">
            {character.currentHp}
            <span className="text-faint"> / {character.maxHp || "—"}</span>
            {character.tempHp > 0 && (
              <span className="text-frost-soft"> +{character.tempHp}</span>
            )}
          </span>
        </div>
        <div className="h-1.5 bg-bg/60 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getHpBarColor(hpRatio)}`}
            style={{ width: `${hpRatio * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-dim">
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
          <span className="text-dim font-medium tabular-nums">AC {character.armorClass}</span>
        </div>
        <span className="text-faint truncate max-w-[55%]" title={ownerLabel}>
          {ownerLabel}
        </span>
      </div>
    </div>
  );
}

export default CharacterCard;
