import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { GeneratedLootItem } from "@shared/dto/ai";
import type { SrdArmorDetail, SrdWeaponDetail } from "@shared/dto/srd";
import { useSrdItemQuery } from "@/queries/srd";
import { describeRarity } from "./itemRarity";

type ItemDetailsModalProps = {
  item: GeneratedLootItem;
  onClose: () => void;
};

const sectionLabel =
  "font-fantasy text-xs font-bold uppercase tracking-[0.2em] text-gold-dim";

const badge = "rounded-full border px-2.5 py-1 text-xs uppercase tracking-widest";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={sectionLabel}>{label}</span>
      <span className="text-base text-ink">{value}</span>
    </div>
  );
}

function WeaponBlock({ weapon }: { weapon: SrdWeaponDetail }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-rule bg-surface-light/20 p-4">
      <div className="flex flex-wrap gap-8">
        {weapon.damageDice ? (
          <div className="flex flex-col gap-1">
            <span className={sectionLabel}>Damage</span>
            <span className="font-fantasy text-2xl text-gold-bright">
              {weapon.damageDice}
              {weapon.damageType ? (
                <span className="ml-2 font-body text-base text-dim">
                  {weapon.damageType.toLowerCase()}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}
        {weapon.category ? <Fact label="Category" value={weapon.category} /> : null}
      </div>

      {weapon.properties.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-rule pt-3">
          <span className={sectionLabel}>Properties</span>
          {weapon.properties.map((property) => (
            <div key={property.name} className="flex flex-col gap-0.5">
              <span className="text-base text-gold">
                {property.name}
                {property.kind ? (
                  <span className="ml-2 text-xs uppercase tracking-widest text-faint">
                    {property.kind}
                  </span>
                ) : null}
              </span>
              <p className="text-base leading-relaxed text-dim">
                {property.description}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ArmorBlock({ armor }: { armor: SrdArmorDetail }) {
  return (
    <div className="flex flex-wrap gap-8 rounded-md border border-rule bg-surface-light/20 p-4">
      {armor.armorClass ? (
        <div className="flex flex-col gap-1">
          <span className={sectionLabel}>Armor class</span>
          <span className="font-fantasy text-2xl text-gold-bright">
            {armor.armorClass}
          </span>
        </div>
      ) : null}
      {armor.category ? <Fact label="Category" value={armor.category} /> : null}
      {armor.strengthRequired ? (
        <Fact label="Strength" value={String(armor.strengthRequired)} />
      ) : null}
      {armor.stealthDisadvantage ? (
        <Fact label="Stealth" value="Disadvantage" />
      ) : null}
    </div>
  );
}

function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  const { data, isLoading, isError, error } = useSrdItemQuery(item.slug);
  const rarity = describeRarity(item.rarity);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative flex max-h-[85vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-md border border-rule bg-surface p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2.5">
            <h3 className="font-fantasy text-2xl font-bold text-gold-bright sm:text-3xl">
              {item.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`${badge} ${rarity.style}`}>{rarity.label}</span>
              {item.itemType ? (
                <span className={`${badge} border-rule text-dim`}>{item.itemType}</span>
              ) : null}
              {data?.requiresAttunement ? (
                <span className={`${badge} border-arcane/60 text-arcane-soft`}>
                  Attunement
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-rule text-lg text-faint transition-colors hover:border-hover hover:text-ink"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="flex animate-pulse flex-col gap-2.5">
            <div className="h-4 w-full rounded bg-rule/70" />
            <div className="h-4 w-11/12 rounded bg-rule/70" />
            <div className="h-4 w-9/12 rounded bg-rule/70" />
          </div>
        ) : isError ? (
          <p className="text-base text-rust-soft">
            {(error as Error).message || "Could not load this item."}
          </p>
        ) : (
          <>
            {data?.weapon ? <WeaponBlock weapon={data.weapon} /> : null}
            {data?.armor ? <ArmorBlock armor={data.armor} /> : null}

            {data?.cost || data?.weight ? (
              <div className="flex flex-wrap gap-8">
                {data.cost ? <Fact label="Cost" value={data.cost} /> : null}
                {data.weight ? <Fact label="Weight" value={data.weight} /> : null}
              </div>
            ) : null}

            {data?.description ? (
              <div className="flex flex-col gap-1.5">
                <span className={sectionLabel}>Rules text</span>
                <p className="whitespace-pre-line text-base leading-relaxed text-ink">
                  {data.description}
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-col gap-1.5 border-t border-rule pt-4">
          <span className={sectionLabel}>Why it is here</span>
          <p className="text-base leading-relaxed text-dim">{item.note}</p>
        </div>

        <p className="text-[11px] uppercase tracking-widest text-faint">
          {item.source} · {item.slug}
        </p>
      </div>
    </div>,
    document.body,
  );
}

export default ItemDetailsModal;
