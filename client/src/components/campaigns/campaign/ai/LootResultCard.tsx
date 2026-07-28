import { useState } from "react";
import { LOOT_RARITY } from "@shared/constants/ai";
import type { LootGeneration, LootRarity } from "@shared/dto/ai";
import CommonButton from "@/components/ui/buttons/CommonButton";

type LootResultCardProps = {
  generation: LootGeneration;
  isRegenerating: boolean;
  onRegenerate: () => void;
};

const rarityStyles: Record<LootRarity, string> = {
  [LOOT_RARITY.Common]: "border-rule text-dim",
  [LOOT_RARITY.Uncommon]: "border-leaf/60 text-leaf-soft",
  [LOOT_RARITY.Rare]: "border-frost/60 text-frost-soft",
  [LOOT_RARITY.VeryRare]: "border-arcane/60 text-arcane-soft",
  [LOOT_RARITY.Legendary]: "border-gold-dim text-gold-bright",
};

const rarityLabels: Record<LootRarity, string> = {
  [LOOT_RARITY.Common]: "Common",
  [LOOT_RARITY.Uncommon]: "Uncommon",
  [LOOT_RARITY.Rare]: "Rare",
  [LOOT_RARITY.VeryRare]: "Very rare",
  [LOOT_RARITY.Legendary]: "Legendary",
};

const toPlainText = (generation: LootGeneration): string =>
  [
    generation.output.readAloud,
    "",
    ...generation.output.items.map(
      (item) => `${item.name} (${rarityLabels[item.rarity]}) — ${item.note}`,
    ),
  ].join("\n");

function LootResultCard({
  generation,
  isRegenerating,
  onRegenerate,
}: LootResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(generation));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gold-dim/50 bg-surface-light/30 p-3">
        <h4 className="mb-2 font-fantasy text-xs font-bold uppercase tracking-[0.2em] text-gold-bright">
          Read aloud
        </h4>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
          {generation.output.readAloud}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="font-fantasy text-xs font-bold uppercase tracking-[0.2em] text-gold">
          Items
        </h4>
        <ul className="flex flex-col gap-2">
          {generation.output.items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="rounded-md border border-rule bg-surface/50 p-3 transition-colors hover:border-hover"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="font-fantasy text-base text-gold">{item.name}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${rarityStyles[item.rarity]}`}
                >
                  {rarityLabels[item.rarity]}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-dim">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <CommonButton
          onClick={onRegenerate}
          variant="secondary"
          size="sm"
          disabled={isRegenerating}
        >
          {isRegenerating ? "Rolling..." : "Regenerate"}
        </CommonButton>
        <CommonButton onClick={handleCopy} variant="secondary" size="sm">
          {copied ? "Copied" : "Copy"}
        </CommonButton>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-faint">
          {generation.meta.provider} · {generation.meta.model}
        </span>
      </div>
    </div>
  );
}

export default LootResultCard;
