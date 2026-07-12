import { useSheet, useSheetActions } from "../../../../../state/sheet";
import type { Ability, ResourcePool, ResourceReset } from "../../../../../types/encounter";
import {
  RESOURCE_RESET_LABELS,
  RESOURCE_RESET_ORDER,
} from "../../../../../constants/resources";
import { AddButton } from "../../buttons/AddButton";
import { SpecialAbilityItem } from "./SpecialAbilityItem";

export const SpecialAbilities = () => {
  const specialAbilities = useSheet((s) => s.specialAbilities);
  const resources = useSheet((s) => s.resources);
  const { setSharedField } = useSheetActions();

  const updateAbility = (id: string, patch: Partial<Ability>) =>
    setSharedField(
      "specialAbilities",
      specialAbilities.map((ability) =>
        ability.id === id ? { ...ability, ...patch } : ability,
      ),
    );

  const removeAbility = (id: string) =>
    setSharedField(
      "specialAbilities",
      specialAbilities.filter((ability) => ability.id !== id),
    );

  const addAbility = () =>
    setSharedField("specialAbilities", [
      ...specialAbilities,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        activation: "action" as const,
        cost: null,
      },
    ]);

  const updatePool = (key: string, patch: Partial<ResourcePool>) =>
    setSharedField(
      "resources",
      resources.map((pool) => (pool.key === key ? { ...pool, ...patch } : pool)),
    );

  const removePool = (key: string) =>
    setSharedField(
      "resources",
      resources.filter((pool) => pool.key !== key),
    );

  const addPool = () =>
    setSharedField("resources", [
      ...resources,
      {
        key: crypto.randomUUID(),
        label: "",
        max: 1,
        remaining: 1,
        resetOn: "longRest" as const,
      },
    ]);

  return (
    <div className="cs-section-card p-3 flex flex-col gap-3">
      <div className="cs-section-title">Abilities</div>

      {specialAbilities.map((ability) => (
        <SpecialAbilityItem
          key={ability.id}
          ability={ability}
          resources={resources}
          onChange={(patch) => updateAbility(ability.id, patch)}
          onRemove={() => removeAbility(ability.id)}
        />
      ))}
      <AddButton label="+ Add ability" onClick={addAbility} />

      <div className="text-xs tracking-[0.12em] uppercase text-gold">Resource pools</div>
      {resources.map((pool) => (
        <div key={pool.key} className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            value={pool.label}
            onChange={(e) => updatePool(pool.key, { label: e.target.value })}
            placeholder="Pool name..."
            className="min-w-28 flex-1 bg-transparent text-sm font-semibold text-gold outline-none placeholder:text-faint"
          />
          <label className="flex items-center gap-1 text-dim">
            max
            <input
              type="number"
              min={1}
              value={pool.max}
              onChange={(e) => {
                const max = Math.max(1, Number(e.target.value) || 1);
                updatePool(pool.key, { max, remaining: Math.min(pool.remaining, max) });
              }}
              className="w-12 rounded border border-rule bg-bg px-1 py-1 text-center text-ink outline-none"
            />
          </label>
          <label className="flex items-center gap-1 text-dim">
            resets
            <select
              value={pool.resetOn}
              onChange={(e) => updatePool(pool.key, { resetOn: e.target.value as ResourceReset })}
              className="rounded border border-rule bg-bg px-1.5 py-1 text-ink outline-none"
            >
              {RESOURCE_RESET_ORDER.map((reset) => (
                <option key={reset} value={reset}>
                  {RESOURCE_RESET_LABELS[reset]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => removePool(pool.key)}
            aria-label={`Remove ${pool.label || "pool"}`}
            className="text-faint hover:text-rust cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
      <AddButton label="+ Add pool" onClick={addPool} />
    </div>
  );
};

export default SpecialAbilities;
