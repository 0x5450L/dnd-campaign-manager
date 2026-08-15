import type {
  SrdArmorDetail,
  SrdItem,
  SrdItemProperty,
  SrdItemSummary,
  SrdSource,
  SrdWeaponDetail,
} from "@dnd/shared/dto/srd";
import { normalizeSrdRarity } from "./rarity";

export type Open5eV2Document = {
  key: string;
  name: string;
};

export type Open5eV2WeaponProperty = {
  property: { name: string; type: string | null; desc: string | null } | null;
  detail: string | null;
};

export type Open5eV2Weapon = {
  damage_dice: string | null;
  damage_type: { name: string } | null;
  is_martial: boolean | null;
  is_simple: boolean | null;
  properties: Open5eV2WeaponProperty[] | null;
};

export type Open5eV2Armor = {
  category: string | null;
  ac_display: string | null;
  ac_base: number | null;
  grants_stealth_disadvantage: boolean | null;
  strength_score_required: number | null;
};

export type Open5eV2ItemResult = {
  key: string;
  name: string;
  desc: string | null;
  rarity: string | null;
  category: { key: string; name: string } | null;
  requires_attunement: boolean | string | null;
  weapon: Open5eV2Weapon | null;
  armor: Open5eV2Armor | null;
  weight: string | null;
  weight_unit: string | null;
  cost: string | null;
  document: Open5eV2Document | null;
};

export type Open5eV2ListResponse<TResult> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TResult[];
};

const trimDecimals = (raw: string | null): string | null => {
  if (!raw) {
    return null;
  }
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value) || value === 0) {
    return null;
  }
  return String(value);
};

const formatCost = (raw: string | null): string | null => {
  const amount = trimDecimals(raw);
  return amount ? `${amount} gp` : null;
};

const formatWeight = (raw: string | null, unit: string | null): string | null => {
  const amount = trimDecimals(raw);
  return amount ? `${amount} ${unit ?? "lb"}` : null;
};

const capitalize = (raw: string | null): string | null =>
  raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;

const mapProperties = (
  raw: Open5eV2WeaponProperty[] | null,
): SrdItemProperty[] =>
  (raw ?? [])
    .map(({ property, detail }) => {
      if (!property?.name) {
        return null;
      }
      const description = [property.desc, detail]
        .filter((part): part is string => !!part?.trim())
        .join(" ");
      return { name: property.name, kind: property.type, description };
    })
    .filter((property): property is SrdItemProperty => property !== null);

const mapWeapon = (raw: Open5eV2Weapon | null): SrdWeaponDetail | null => {
  if (!raw) {
    return null;
  }
  const category = raw.is_martial ? "Martial" : raw.is_simple ? "Simple" : null;
  return {
    damageDice: raw.damage_dice,
    damageType: raw.damage_type?.name ?? null,
    category,
    properties: mapProperties(raw.properties),
  };
};

const mapArmor = (raw: Open5eV2Armor | null): SrdArmorDetail | null => {
  if (!raw) {
    return null;
  }
  return {
    category: capitalize(raw.category),
    armorClass: raw.ac_display ?? (raw.ac_base !== null ? String(raw.ac_base) : null),
    strengthRequired: raw.strength_score_required,
    stealthDisadvantage: !!raw.grants_stealth_disadvantage,
  };
};

export const mapOpen5eV2ItemSummary = (
  raw: Open5eV2ItemResult,
  source: SrdSource,
): SrdItemSummary => ({
  slug: raw.key,
  name: raw.name,
  source,
  itemType: raw.category?.name ?? null,
  rarity: normalizeSrdRarity(raw.rarity),
});

export const mapOpen5eV2Item = (
  raw: Open5eV2ItemResult,
  source: SrdSource,
): SrdItem => ({
  ...mapOpen5eV2ItemSummary(raw, source),
  description: raw.desc?.trim() ?? "",
  requiresAttunement:
    typeof raw.requires_attunement === "string"
      ? !!raw.requires_attunement.trim()
      : !!raw.requires_attunement,
  cost: formatCost(raw.cost),
  weight: formatWeight(raw.weight, raw.weight_unit),
  weapon: mapWeapon(raw.weapon),
  armor: mapArmor(raw.armor),
});
