import type { Ability, AbilityCost, ResourcePool } from "../../../../../types/encounter";
import {
  ABILITY_ACTIVATION_NAMES,
  ABILITY_ACTIVATION_ORDER,
} from "../../../../../constants/abilities";

type CostKind = "none" | "recharge" | "perDay" | "pool";

const costKindOf = (cost: Ability["cost"]): CostKind =>
  cost && cost.type !== "spellSlot" ? cost.type : "none";

const defaultCost = (kind: CostKind, resources: ResourcePool[]): AbilityCost | null => {
  switch (kind) {
    case "recharge":
      return { type: "recharge", threshold: 5, charged: true };
    case "perDay":
      return { type: "perDay", max: 1, remaining: 1 };
    case "pool":
      return { type: "pool", pool: resources[0]?.key ?? "", amount: 1 };
    case "none":
      return null;
  }
};

type SpecialAbilityItemProps = {
  ability: Ability;
  resources: ResourcePool[];
  onChange: (patch: Partial<Ability>) => void;
  onRemove: () => void;
};

export const SpecialAbilityItem = ({
  ability,
  resources,
  onChange,
  onRemove,
}: SpecialAbilityItemProps) => {
  const cost = ability.cost;
  const costKind = costKindOf(cost);

  return (
    <div className="flex flex-col gap-1.5 border-b border-rule/50 pb-2 last:border-b-0">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={ability.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Name..."
          className="flex-1 bg-transparent outline-none text-sm font-semibold text-gold placeholder:text-faint"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${ability.name || "ability"}`}
          className="text-faint hover:text-rust cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select
          value={ability.activation}
          onChange={(e) => onChange({ activation: e.target.value as Ability["activation"] })}
          className="rounded border border-rule bg-bg px-1.5 py-1 text-ink outline-none"
        >
          {ABILITY_ACTIVATION_ORDER.map((activation) => (
            <option key={activation} value={activation}>
              {ABILITY_ACTIVATION_NAMES[activation]}
            </option>
          ))}
        </select>

        <select
          value={costKind}
          onChange={(e) => onChange({ cost: defaultCost(e.target.value as CostKind, resources) })}
          className="rounded border border-rule bg-bg px-1.5 py-1 text-ink outline-none"
        >
          <option value="none">No cost</option>
          <option value="recharge">Recharge</option>
          <option value="perDay">Per day</option>
          <option value="pool">Pool</option>
        </select>

        {cost?.type === "recharge" && (
          <label className="flex items-center gap-1 text-dim">
            on
            <input
              type="number"
              min={2}
              max={6}
              value={cost.threshold}
              onChange={(e) =>
                onChange({ cost: { ...cost, threshold: Number(e.target.value) || 6 } })
              }
              className="w-12 rounded border border-rule bg-bg px-1 py-1 text-center text-ink outline-none"
            />
            –6
          </label>
        )}

        {cost?.type === "perDay" && (
          <label className="flex items-center gap-1 text-dim">
            <input
              type="number"
              min={1}
              value={cost.max}
              onChange={(e) => {
                const max = Math.max(1, Number(e.target.value) || 1);
                onChange({ cost: { ...cost, max, remaining: max } });
              }}
              className="w-12 rounded border border-rule bg-bg px-1 py-1 text-center text-ink outline-none"
            />
            / day
          </label>
        )}

        {cost?.type === "pool" && (
          <>
            <select
              value={cost.pool}
              onChange={(e) => onChange({ cost: { ...cost, pool: e.target.value } })}
              className="rounded border border-rule bg-bg px-1.5 py-1 text-ink outline-none"
            >
              {resources.length === 0 && <option value="">No pools yet</option>}
              {resources.map((pool) => (
                <option key={pool.key} value={pool.key}>
                  {pool.label || "Unnamed pool"}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-dim">
              ×
              <input
                type="number"
                min={1}
                value={cost.amount}
                onChange={(e) =>
                  onChange({
                    cost: { ...cost, amount: Math.max(1, Number(e.target.value) || 1) },
                  })
                }
                className="w-12 rounded border border-rule bg-bg px-1 py-1 text-center text-ink outline-none"
              />
            </label>
          </>
        )}
      </div>

      <textarea
        value={ability.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description..."
        className="custom-scrollbar min-h-14 w-full resize-none bg-transparent text-xs leading-relaxed text-ink outline-none placeholder:text-faint"
      />
    </div>
  );
};

export default SpecialAbilityItem;
