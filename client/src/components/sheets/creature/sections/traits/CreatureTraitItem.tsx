import type { CreatureTrait } from "../../../../../types/characters/characterSheet";

type CreatureTraitItemProps = {
  trait: CreatureTrait;
  onChange: (patch: Partial<CreatureTrait>) => void;
  onRemove: () => void;
};

export const CreatureTraitItem = ({ trait, onChange, onRemove }: CreatureTraitItemProps) => (
  <div className="flex flex-col gap-1 border-b border-rule/50 pb-2 last:border-b-0">
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={trait.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Name..."
        className="flex-1 bg-transparent outline-none text-sm font-semibold text-gold placeholder:text-faint"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${trait.name || "trait"}`}
        className="text-faint hover:text-rust cursor-pointer transition-colors"
      >
        ✕
      </button>
    </div>
    <textarea
      value={trait.description}
      onChange={(e) => onChange({ description: e.target.value })}
      placeholder="Description..."
      className="w-full bg-transparent outline-none text-xs leading-relaxed text-ink placeholder:text-faint resize-none min-h-14 custom-scrollbar"
    />
  </div>
);
