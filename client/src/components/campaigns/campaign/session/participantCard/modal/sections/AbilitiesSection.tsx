import type { AbilityCost, ResourcePool } from "../../../../../../../types/encounter";
import {
  ABILITY_ACTIVATION_LABELS,
  ABILITY_ACTIVATION_ORDER,
} from "../../../../../../../constants/abilities";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";

const costBadge = (cost: AbilityCost | null, pools: ResourcePool[] | null): string | null => {
  if (!cost) return null;
  switch (cost.type) {
    case "recharge":
      return cost.threshold >= 6 ? "Recharge 6" : `Recharge ${cost.threshold}–6`;
    case "perDay":
      return `${cost.remaining}/${cost.max} per day`;
    case "spellSlot":
      return `Level ${cost.level} slot`;
    case "pool": {
      const label = pools?.find((pool) => pool.key === cost.pool)?.label ?? cost.pool;
      return cost.amount > 1 ? `${cost.amount} × ${label}` : label;
    }
  }
};

export const AbilitiesSection = ({ draft }: EditorBodyProps) => {
  const abilities = draft.abilities ?? [];
  if (abilities.length === 0) return null;

  const groups = ABILITY_ACTIVATION_ORDER.map((activation) => ({
    activation,
    items: abilities.filter((ability) => ability.activation === activation),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ activation, items }) => (
        <div key={activation} className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
            {ABILITY_ACTIVATION_LABELS[activation]}
          </span>
          <div className="flex flex-col gap-1.5">
            {items.map((ability) => {
              const badge = costBadge(ability.cost, draft.resources);
              return (
                <div key={ability.id} className="rounded-md border border-rule bg-bg/60 px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-fantasy font-bold text-ink">{ability.name}</span>
                    {badge && (
                      <span className="rounded border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-gold">
                        {badge}
                      </span>
                    )}
                  </div>
                  {ability.description && (
                    <p className="mt-1 text-sm leading-snug text-dim">{ability.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbilitiesSection;
