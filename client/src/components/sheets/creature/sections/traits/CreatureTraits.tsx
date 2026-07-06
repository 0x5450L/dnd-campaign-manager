import { useCreatureSheet, useSheetActions } from "../../../../../state/sheet";
import type {
  CreatureTrait,
  CreatureTraitKind,
} from "../../../../../types/characters/characterSheet";
import { AddButton } from "../../../shared/buttons/AddButton";
import { CreatureTraitItem } from "./CreatureTraitItem";

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
    <div className="cs-section-card p-3 flex flex-col gap-3">
      <div className="cs-section-title">Features & Traits</div>

      {GROUPS.map((group) => {
        const traits = allTraits.filter((t) => t.kind === group.kind);
        return (
          <div key={group.kind} className="flex flex-col gap-2">
            <div className="text-xs tracking-[0.12em] uppercase text-gold">
              {group.title}
            </div>

            {traits.map((trait) => (
              <CreatureTraitItem
                key={trait.id}
                trait={trait}
                onChange={(patch) => updateTrait(trait.id, patch)}
                onRemove={() => removeTrait(trait.id)}
              />
            ))}

            <AddButton
              label={group.addLabel}
              onClick={() => addTrait(group.kind)}
            />
          </div>
        );
      })}
    </div>
  );
};
