import { useCreatureSheet, useSheetActions } from "../../../../state/sheet";
import type {
  CreatureTrait,
  CreatureTraitKind,
} from "../../../../types/characters/characterSheet";

const GROUPS: { kind: CreatureTraitKind; title: string; addLabel: string }[] = [
  { kind: "trait", title: "Traits", addLabel: "+ Add trait" },
  {
    kind: "legendary_action",
    title: "Legendary Actions",
    addLabel: "+ Add legendary action",
  },
];

export const CreatureTraits = () => {
  const allTraits = useCreatureSheet((s) => s.traits);
  const { setCreatureField } = useSheetActions();

  const updateTrait = (id: string, patch: Partial<CreatureTrait>) =>
    setCreatureField(
      "traits",
      allTraits.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );

  const removeTrait = (id: string) =>
    setCreatureField(
      "traits",
      allTraits.filter((t) => t.id !== id),
    );

  const addTrait = (kind: CreatureTraitKind) =>
    setCreatureField("traits", [
      ...allTraits,
      { id: crypto.randomUUID(), kind, name: "", description: "" },
    ]);

  return (
    <div className="rounded-md border-[1.5px] border-rule bg-surface/70 shadow-md p-3 flex flex-col gap-3">
      <div className="font-fantasy font-bold text-sm tracking-[0.16em] uppercase text-gold-bright">
        Features & Traits
      </div>

      {GROUPS.map((group) => {
        const traits = allTraits.filter((t) => t.kind === group.kind);
        return (
          <div key={group.kind} className="flex flex-col gap-2">
            <div className="text-xs tracking-[0.12em] uppercase text-gold">
              {group.title}
            </div>

            {traits.map((trait) => (
              <div
                key={trait.id}
                className="flex flex-col gap-1 border-b border-rule/50 pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trait.name}
                    onChange={(e) => updateTrait(trait.id, { name: e.target.value })}
                    placeholder="Name..."
                    className="flex-1 bg-transparent outline-none text-sm font-semibold text-gold placeholder:text-faint"
                  />
                  <button
                    type="button"
                    onClick={() => removeTrait(trait.id)}
                    aria-label={`Remove ${trait.name || "trait"}`}
                    className="text-faint hover:text-rust cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={trait.description}
                  onChange={(e) =>
                    updateTrait(trait.id, { description: e.target.value })
                  }
                  placeholder="Description..."
                  className="w-full bg-transparent outline-none text-xs leading-relaxed text-ink placeholder:text-faint resize-none min-h-14 custom-scrollbar"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => addTrait(group.kind)}
              className="self-start text-xs text-gold-dim hover:text-gold cursor-pointer transition-colors"
            >
              {group.addLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
};
