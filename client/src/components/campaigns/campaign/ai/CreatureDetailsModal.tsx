import { ABILITY_NAMES } from "@dnd/shared/constants/dnd";
import type { GeneratedEncounterEntry } from "@dnd/shared/dto/ai";
import type { SrdCreature, SrdCreatureAction } from "@dnd/shared/dto/srd";
import { useSrdCreatureQuery } from "@/queries/srd";
import Modal from "@/components/ui/Modal";
import { challengeRatingLabel, formatAbilityModifier } from "@/utils/dndMath";

type CreatureDetailsModalProps = {
  entry: GeneratedEncounterEntry;
  onClose: () => void;
};

const badge =
  "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest";

const groupLabel =
  "font-fantasy text-sm font-bold uppercase tracking-[0.2em] text-gold-bright";

const metaItem =
  "flex items-baseline gap-1.5 border-l border-rule/70 pl-4 first:border-l-0 first:pl-0";

const vitalCell =
  "flex grow basis-0 items-baseline justify-center gap-2 border-l border-rule/70 px-3 first:border-l-0";

const formatSpeed = (speed: SrdCreature["speed"]): string =>
  Object.entries(speed)
    .map(([mode, value]) => (mode === "walk" ? `${value} ft.` : `${mode} ${value} ft.`))
    .join(", ");

function VitalsBlock({ creature }: { creature: SrdCreature }) {
  const meta: [string, string][] = (
    [
      ["Speed", formatSpeed(creature.speed)],
      ["Armor", creature.armorDescription],
      ["Senses", creature.senses],
      ["Languages", creature.languages],
      ["Vulnerable", creature.damageVulnerabilities],
      ["Resistant", creature.damageResistances],
      ["Immune", creature.damageImmunities],
      ["Cond. immune", creature.conditionImmunities],
    ] as [string, string | null][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="flex flex-col rounded-md border border-rule bg-bg/60 px-3 py-2.5">
      <div className="flex items-stretch">
        <div className={vitalCell}>
          <span className="font-fantasy text-xs font-bold uppercase tracking-[0.18em] text-gold-dim">
            AC
          </span>
          <span className="font-fantasy text-xl font-bold leading-none text-ink">
            {creature.armorClass}
          </span>
        </div>
        <div className={vitalCell}>
          <span className="font-fantasy text-xs font-bold uppercase tracking-[0.18em] text-gold-dim">
            HP
          </span>
          <span className="font-fantasy text-xl font-bold leading-none text-ink">
            {creature.hitPoints}
          </span>
          {creature.hitDice ? (
            <span className="text-xs text-faint">({creature.hitDice})</span>
          ) : null}
        </div>
        {creature.size ? (
          <div className={vitalCell}>
            <span className="font-fantasy text-xs font-bold uppercase tracking-[0.18em] text-gold-dim">
              Size
            </span>
            <span className="font-fantasy text-base font-bold leading-none text-ink">
              {creature.size}
            </span>
          </div>
        ) : null}
      </div>

      {meta.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2 border-t border-rule/70 pt-2.5">
          {meta.map(([label, value]) => (
            <div key={label} className={metaItem}>
              <span className="font-fantasy text-[10px] font-bold uppercase tracking-[0.18em] text-gold-dim">
                {label}
              </span>
              <span className="text-sm font-medium text-ink">{value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AbilityStrip({ creature }: { creature: SrdCreature }) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2 rounded-md border border-rule bg-bg/40 px-2 py-2">
      {ABILITY_NAMES.map((ability) => {
        const score = creature.abilities[ability] ?? 10;
        return (
          <div key={ability} className="flex min-w-16 flex-1 flex-col items-center gap-1">
            <span className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-gold-bright sm:text-sm">
              {ability}
            </span>
            <span className="font-fantasy text-lg font-bold leading-none text-ink sm:text-xl">
              {formatAbilityModifier(score)}
            </span>
            <span className="text-xs font-medium leading-none text-faint sm:text-sm">
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TraitList({ label, traits }: { label: string; traits: SrdCreatureAction[] }) {
  if (traits.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-2.5">
      <h4 className={`${groupLabel} border-b border-rule pb-1.5`}>{label}</h4>
      {traits.map((trait) => (
        <div key={trait.name} className="flex flex-col gap-0.5">
          <span className="font-fantasy text-base font-bold text-gold">
            {trait.name}
          </span>
          <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-dim">
            {trait.description}
          </p>
        </div>
      ))}
    </section>
  );
}

function CreatureDetailsModal({ entry, onClose }: CreatureDetailsModalProps) {
  const { data, isLoading, isError, error } = useSrdCreatureQuery(entry.slug);

  return (
    <Modal
      onClose={onClose}
      label={entry.name}
      title={
        <>
          <h3 className="truncate font-fantasy text-xl font-bold text-gold-bright sm:text-2xl">
            {entry.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`${badge} border-gold-dim/60 font-bold text-gold`}>
              CR {challengeRatingLabel(entry.challengeRating) ?? "?"}
            </span>
            <span className={`${badge} border-rule text-dim`}>{entry.xpEach} XP</span>
            {entry.count > 1 ? (
              <span className={`${badge} border-rule text-dim`}>× {entry.count}</span>
            ) : null}
            {data?.type ? (
              <span className={`${badge} border-rule text-dim`}>{data.type}</span>
            ) : null}
          </div>
        </>
      }
    >
      {isLoading ? (
        <div className="flex animate-pulse flex-col gap-2">
          <div className="h-3 w-full rounded bg-rule/70" />
          <div className="h-3 w-11/12 rounded bg-rule/70" />
          <div className="h-3 w-9/12 rounded bg-rule/70" />
        </div>
      ) : isError ? (
        <p className="text-sm font-medium text-rust-soft">
          {(error as Error).message || "Could not load this creature."}
        </p>
      ) : data ? (
        <>
          <VitalsBlock creature={data} />
          <AbilityStrip creature={data} />
          <TraitList label="Traits" traits={data.specialAbilities} />
          <TraitList label="Actions" traits={data.actions} />
          <TraitList label="Legendary actions" traits={data.legendaryActions} />
        </>
      ) : null}

      <section className="flex flex-col gap-1.5">
        <h4 className={`${groupLabel} border-b border-rule pb-1.5`}>Why it is here</h4>
        <p className="text-sm font-medium leading-relaxed text-dim">{entry.note}</p>
        <p className="text-[10px] uppercase tracking-widest text-faint">
          {entry.source} · {entry.slug}
        </p>
      </section>
    </Modal>
  );
}

export default CreatureDetailsModal;
