import { useState } from "react";
import type { GeneratedLootItem, LootGeneration } from "@shared/dto/ai";
import CommonButton from "@/components/ui/buttons/CommonButton";
import ItemDetailsModal from "./ItemDetailsModal";
import { describeRarity } from "./itemRarity";

type LootResultCardProps = {
  generation: LootGeneration;
  isRegenerating: boolean;
  onRegenerate: () => void;
};

function LootResultCard({
  generation,
  isRegenerating,
  onRegenerate,
}: LootResultCardProps) {
  const [openItem, setOpenItem] = useState<GeneratedLootItem | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <section className="shrink-0 rounded-md border border-gold-dim/50 bg-surface-light/30">
        <h4 className="px-3 pt-3 font-fantasy text-xs font-bold uppercase tracking-[0.2em] text-gold-bright">
          Read aloud
        </h4>
        <div className="custom-scrollbar max-h-44 px-3 pb-3 pt-2">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
            {generation.output.readAloud}
          </p>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col gap-2">
        <h4 className="shrink-0 font-fantasy text-xs font-bold uppercase tracking-[0.2em] text-gold">
          Items
        </h4>
        <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 pr-1">
          {generation.output.items.map((item) => {
            const rarity = describeRarity(item.rarity);
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => setOpenItem(item)}
                  className="w-full rounded-md border border-rule bg-surface/50 p-3 text-left transition-colors hover:border-hover hover:bg-surface-light/30"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-fantasy text-base text-gold">{item.name}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${rarity.style}`}
                    >
                      {rarity.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-dim">{item.note}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <CommonButton
          onClick={onRegenerate}
          variant="secondary"
          size="sm"
          disabled={isRegenerating}
        >
          {isRegenerating ? "Rolling..." : "Regenerate"}
        </CommonButton>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-faint">
          {generation.meta.provider} · {generation.meta.model}
        </span>
      </div>

      {openItem ? (
        <ItemDetailsModal item={openItem} onClose={() => setOpenItem(null)} />
      ) : null}
    </div>
  );
}

export default LootResultCard;
