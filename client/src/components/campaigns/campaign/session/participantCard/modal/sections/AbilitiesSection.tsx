import type { Ability, AbilityCost, ResourcePool } from "../../../../../../../types/encounter";
import {
  ABILITY_ACTIVATION_LABELS,
  ABILITY_ACTIVATION_ORDER,
} from "../../../../../../../constants/abilities";
import type { EditorBodyProps } from "../../../../../../../types/components/participantCard";
import { useLiveSession } from "../../../../../../../hooks/useLiveSession";
import { canApplyAbilityUsage } from "../../../../../../../../../shared/utils/abilityUsage";

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

type AbilityCardProps = {
  ability: Ability;
  abilities: Ability[];
  resources: ResourcePool[];
  interactive: boolean;
  onUsage: (abilityId: string, action: "spend" | "restore") => void;
};

const AbilityCard = ({ ability, abilities, resources, interactive, onUsage }: AbilityCardProps) => {
  const badge = costBadge(ability.cost, resources);
  const canSpend = interactive && canApplyAbilityUsage(abilities, resources, ability.id, "spend");
  const canRestore =
    interactive && canApplyAbilityUsage(abilities, resources, ability.id, "restore");

  return (
    <div className="rounded-md border border-rule bg-bg/60 px-3 py-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-fantasy font-bold text-ink">{ability.name}</span>
        {badge &&
          (canSpend || canRestore ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canSpend}
                onClick={() => onUsage(ability.id, "spend")}
                className={`rounded border px-1.5 py-0.5 text-[11px] uppercase tracking-wider transition-colors ${
                  canSpend
                    ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/25"
                    : "border-rule bg-bg/40 text-faint"
                }`}
              >
                {badge}
              </button>
              {canRestore && (
                <button
                  type="button"
                  onClick={() => onUsage(ability.id, "restore")}
                  aria-label={`Restore ${ability.name}`}
                  className="rounded border border-rule px-1 py-0.5 text-[11px] text-faint transition-colors hover:border-hover hover:text-ink"
                >
                  ↺
                </button>
              )}
            </span>
          ) : (
            <span className="rounded border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-gold">
              {badge}
            </span>
          ))}
      </div>
      {ability.description && (
        <p className="mt-1 text-sm leading-snug text-dim">{ability.description}</p>
      )}
    </div>
  );
};

export const AbilitiesSection = ({ draft, canEditOwn }: EditorBodyProps) => {
  const { participants, applyAbilityUsage } = useLiveSession();
  const abilities = draft.abilities ?? [];
  const resources = draft.resources ?? [];
  if (abilities.length === 0) return null;

  const interactive = canEditOwn && participants.some((p) => p.id === draft.id);

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
            {items.map((ability) => (
              <AbilityCard
                key={ability.id}
                ability={ability}
                abilities={abilities}
                resources={resources}
                interactive={interactive}
                onUsage={(abilityId, action) => applyAbilityUsage(draft.id, abilityId, action)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbilitiesSection;
