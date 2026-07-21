import { useState } from "react";
import type { Ability, AbilityCost, ResourcePool, SpellSlotLevel } from "@/types/encounter";
import type { AbilityUsageAction } from "@/types/encounter";
import {
  ABILITY_ACTIVATION_LABELS,
  ABILITY_ACTIVATION_ORDER,
} from "@/constants/abilities";
import type { EditorBodyProps } from "@/types/components/participantCard";
import { useActiveEncounter } from "@/hooks/liveSession/useActiveEncounter";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";
import { canApplyAbilityUsage } from "@shared/utils/abilityUsage";
import { listCastableSlotLevels } from "@shared/utils/spellSlotUsage";
import { useSrdSpellIndexQuery } from "@/queries/srd";
import { lookupSpell, type SpellIndex } from "@/utils/srd/spellIndex";
import { SpellDetailBody } from "@/components/sheets/shared/sections/specialAbilities/SpellReferenceAccordion";

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
  spellSlots: SpellSlotLevel[];
  spellIndex: SpellIndex | undefined;
  interactive: boolean;
  onUsage: (abilityId: string, action: AbilityUsageAction, slotLevel?: number) => void;
};

const AbilityCard = ({
  ability,
  abilities,
  resources,
  spellSlots,
  spellIndex,
  interactive,
  onUsage,
}: AbilityCardProps) => {
  const [picker, setPicker] = useState<AbilityUsageAction | null>(null);
  const [expanded, setExpanded] = useState(false);
  const spell = spellIndex ? lookupSpell(spellIndex, ability.name) : null;
  const badge = costBadge(ability.cost, resources);
  const canSpend =
    interactive && canApplyAbilityUsage(abilities, resources, spellSlots, ability.id, "spend");
  const canRestore =
    interactive && canApplyAbilityUsage(abilities, resources, spellSlots, ability.id, "restore");

  const slotCostLevel = ability.cost?.type === "spellSlot" ? ability.cost.level : null;
  const pickerLevels =
    slotCostLevel !== null && picker
      ? listCastableSlotLevels(spellSlots, slotCostLevel, picker)
      : [];

  const handleUsage = (action: AbilityUsageAction) => {
    if (slotCostLevel === null) {
      onUsage(ability.id, action);
      return;
    }
    const levels = listCastableSlotLevels(spellSlots, slotCostLevel, action);
    if (levels.length === 0) return;
    if (levels.length === 1) {
      onUsage(ability.id, action, levels[0]);
      setPicker(null);
      return;
    }
    setPicker((current) => (current === action ? null : action));
  };

  const pickLevel = (level: number) => {
    if (!picker) return;
    onUsage(ability.id, picker, level);
    setPicker(null);
  };

  return (
    <div className="rounded-md border border-rule bg-bg/60 px-3 py-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {spell ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex items-center gap-1 font-fantasy font-bold text-ink cursor-pointer transition-colors hover:text-gold"
          >
            <span className="text-xs text-faint">{expanded ? "▾" : "▸"}</span>
            {ability.name}
          </button>
        ) : (
          <span className="font-fantasy font-bold text-ink">{ability.name}</span>
        )}
        {badge &&
          (canSpend || canRestore ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canSpend}
                onClick={() => handleUsage("spend")}
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
                  onClick={() => handleUsage("restore")}
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
      {picker && pickerLevels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-faint">
            {picker === "spend" ? "Use slot:" : "Restore slot:"}
          </span>
          {pickerLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => pickLevel(level)}
              className="rounded border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-gold transition-colors hover:bg-gold/25"
            >
              Lvl {level}
            </button>
          ))}
        </div>
      )}
      {ability.description && (
        <p className="mt-1 text-sm leading-snug text-dim">{ability.description}</p>
      )}
      {spell && expanded && (
        <div className="mt-2">
          <SpellDetailBody spell={spell} />
        </div>
      )}
    </div>
  );
};

export const AbilitiesSection = ({ participant, canEditOwn }: EditorBodyProps) => {
  const { participants } = useActiveEncounter();
  const { applyAbilityUsage } = useParticipantActions();
  const abilities = participant.abilities ?? [];
  const resources = participant.resources ?? [];
  const spellSlots = participant.spellSlots ?? [];

  const isCaster =
    participant.spellAbility != null ||
    spellSlots.some((slot) => slot.total > 0) ||
    abilities.some((ability) => ability.cost?.type === "spellSlot");
  const { data: spellIndex } = useSrdSpellIndexQuery(isCaster);

  if (abilities.length === 0) return null;

  const interactive = canEditOwn && participants.some((p) => p.id === participant.id);

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
                spellSlots={spellSlots}
                spellIndex={spellIndex}
                interactive={interactive}
                onUsage={(abilityId, action, slotLevel) =>
                  applyAbilityUsage(participant.id, abilityId, action, slotLevel)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbilitiesSection;
