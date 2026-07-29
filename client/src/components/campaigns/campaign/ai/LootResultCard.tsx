import { useState } from "react";
import { SRD_RARITY } from "@shared/constants/srd";
import type { GeneratedLootItem, LootGeneration } from "@shared/dto/ai";
import type { SrdRarity } from "@shared/dto/srd";
import CommonButton from "@/components/ui/buttons/CommonButton";

type LootResultCardProps = {
  generation: LootGeneration;
  isRegenerating: boolean;
  onRegenerate: () => void;
};

const rarityStyles: Record<SrdRarity, string> = {
  [SRD_RARITY.Common]: "border-rule text-dim",
  [SRD_RARITY.Uncommon]: "border-leaf/60 text-leaf-soft",
  [SRD_RARITY.Rare]: "border-frost/60 text-frost-soft",
  [SRD_RARITY.VeryRare]: "border-arcane/60 text-arcane-soft",
  [SRD_RARITY.Legendary]: "border-gold-dim text-gold-bright",
  [SRD_RARITY.Artifact]: "border-rust/60 text-rust-soft",
};

const rarityLabels: Record<SrdRarity, string> = {
  [SRD_RARITY.Common]: "Common",
  [SRD_RARITY.Uncommon]: "Uncommon",
  [SRD_RARITY.Rare]: "Rare",
  [SRD_RARITY.VeryRare]: "Very rare",
  [SRD_RARITY.Legendary]: "Legendary",
  [SRD_RARITY.Artifact]: "Artifact",
};

const MUNDANE_STYLE = "border-rule/60 text-faint";
const MUNDANE_LABEL = "Gear";

const describeRarity = (item: GeneratedLootItem) =>
  item.rarity
    ? { label: rarityLabels[item.rarity], style: rarityStyles[item.rarity] }
    : { label: MUNDANE_LABEL, style: MUNDANE_STYLE };

const toPlainText = (generation: LootGeneration): string =>
  [
    generation.output.readAloud,
    "",
    ...generation.output.items.map(
      (item) => `${item.name} (${describeRarity(item).label}) — ${item.note}`,
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
          {generation.output.items.map((item) => {
            const rarity = describeRarity(item);
            return (
              <li
                key={item.slug}
                className="rounded-md border border-rule bg-surface/50 p-3 transition-colors hover:border-hover"
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-fantasy text-base text-gold">{item.name}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${rarity.style}`}
                  >
                    {rarity.label}
                  </span>
                </div>
                <p className="mb-2 text-sm leading-relaxed text-dim">{item.note}</p>
                <p className="text-[10px] uppercase tracking-widest text-faint">
                  {item.itemType ? `${item.itemType} · ` : ""}
                  {item.slug}
                </p>
              </li>
            );
          })}
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
