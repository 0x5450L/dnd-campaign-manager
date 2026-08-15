import { SRD_RARITY } from "@dnd/shared/constants/srd";
import type { SrdRarity } from "@dnd/shared/dto/srd";

const styles: Record<SrdRarity, string> = {
  [SRD_RARITY.Common]: "border-rule text-dim",
  [SRD_RARITY.Uncommon]: "border-leaf/60 text-leaf-soft",
  [SRD_RARITY.Rare]: "border-frost/60 text-frost-soft",
  [SRD_RARITY.VeryRare]: "border-arcane/60 text-arcane-soft",
  [SRD_RARITY.Legendary]: "border-gold-dim text-gold-bright",
  [SRD_RARITY.Artifact]: "border-rust/60 text-rust-soft",
};

const labels: Record<SrdRarity, string> = {
  [SRD_RARITY.Common]: "Common",
  [SRD_RARITY.Uncommon]: "Uncommon",
  [SRD_RARITY.Rare]: "Rare",
  [SRD_RARITY.VeryRare]: "Very rare",
  [SRD_RARITY.Legendary]: "Legendary",
  [SRD_RARITY.Artifact]: "Artifact",
};

const MUNDANE = { label: "Gear", style: "border-rule/60 text-faint" };

export const describeRarity = (rarity: SrdRarity | null) =>
  rarity ? { label: labels[rarity], style: styles[rarity] } : MUNDANE;
