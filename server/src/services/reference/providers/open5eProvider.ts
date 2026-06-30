import type { AbilityName } from "../../../../../shared/types/dnd";
import { SRD_CATEGORY, SRD_SOURCE } from "../../../../../shared/constants/srd";
import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdListPage, SrdMonster, SrdMonsterAction, SrdMonsterSummary, SrdQuery, SrdSource } from "../../../../../shared/dto/srd";
import { AbstractContentProvider } from "./abstractContentProvider";
import { ProviderRequestError } from "./providerErrors";

interface Open5eConditionResult {
  slug: string;
  name: string;
  desc: string;
}

interface Open5eActionResult {
  name: string;
  desc: string;
}

interface Open5eMonsterResult {
  slug: string;
  name: string;
  size: string | null;
  type: string | null;
  alignment: string | null;
  armor_class: number;
  armor_desc: string | null;
  hit_points: number;
  hit_dice: string | null;
  speed: Record<string, number> | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number | null;
  dexterity_save: number | null;
  constitution_save: number | null;
  intelligence_save: number | null;
  wisdom_save: number | null;
  charisma_save: number | null;
  skills: Record<string, number> | null;
  senses: string | null;
  languages: string | null;
  damage_vulnerabilities: string | null;
  damage_resistances: string | null;
  damage_immunities: string | null;
  condition_immunities: string | null;
  challenge_rating: string;
  cr: number;
  actions: Open5eActionResult[] | null;
  special_abilities: Open5eActionResult[] | null;
  legendary_actions: Open5eActionResult[] | null;
}

interface Open5eListResponse<TResult> {
  count: number;
  next: string | null;
  results: TResult[];
}

const SAVE_FIELDS: ReadonlyArray<[AbilityName, keyof Open5eMonsterResult]> = [
  ["str", "strength_save"],
  ["dex", "dexterity_save"],
  ["con", "constitution_save"],
  ["int", "intelligence_save"],
  ["wis", "wisdom_save"],
  ["cha", "charisma_save"],
];

export class Open5eProvider extends AbstractContentProvider {
  readonly id: SrdSource = SRD_SOURCE.Open5e;
  readonly capabilities: ReadonlySet<SrdCategory> = new Set<SrdCategory>([
    SRD_CATEGORY.Condition,
    SRD_CATEGORY.Monster,
  ]);
  protected readonly baseUrl = "https://api.open5e.com/v1";

  override async getCondition(slug: string): Promise<SrdCondition | null> {
    const response = await this.getOrNull<Open5eConditionResult>(
      `/conditions/${slug}/`,
    );
    if (!response) {
      return null;
    }
    return {
      slug: response.slug,
      name: response.name,
      source: this.id,
      description: response.desc,
    };
  }

  override async searchConditions(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdConditionSummary>> {
    const path = `/conditions/${this.encodeQuery({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    })}`;
    const response =
      await this.getJson<Open5eListResponse<Open5eConditionResult>>(path);
    return {
      results: response.results.map((item) => ({
        slug: item.slug,
        name: item.name,
        source: this.id,
      })),
      total: response.count,
      next: response.next,
    };
  }

  override async getMonster(slug: string): Promise<SrdMonster | null> {
    const response = await this.getOrNull<Open5eMonsterResult>(
      `/monsters/${slug}/`,
    );
    if (!response) {
      return null;
    }
    return this.mapMonster(response);
  }

  override async searchMonsters(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdMonsterSummary>> {
    const path = `/monsters/${this.encodeQuery({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    })}`;
    const response =
      await this.getJson<Open5eListResponse<Open5eMonsterResult>>(path);
    return {
      results: response.results.map((item) => ({
        slug: item.slug,
        name: item.name,
        source: this.id,
        challengeRating: item.cr,
        type: item.type ?? null,
      })),
      total: response.count,
      next: response.next,
    };
  }

  private mapMonster(raw: Open5eMonsterResult): SrdMonster {
    return {
      slug: raw.slug,
      name: raw.name,
      source: this.id,
      challengeRating: raw.cr,
      type: emptyToNull(raw.type),
      size: emptyToNull(raw.size),
      alignment: emptyToNull(raw.alignment),
      armorClass: raw.armor_class,
      armorDescription: emptyToNull(raw.armor_desc),
      hitPoints: raw.hit_points,
      hitDice: emptyToNull(raw.hit_dice),
      speed: raw.speed ?? {},
      abilities: {
        str: raw.strength,
        dex: raw.dexterity,
        con: raw.constitution,
        int: raw.intelligence,
        wis: raw.wisdom,
        cha: raw.charisma,
      },
      savingThrows: this.collectSaves(raw),
      skills: raw.skills ?? {},
      senses: emptyToNull(raw.senses),
      languages: emptyToNull(raw.languages),
      damageVulnerabilities: emptyToNull(raw.damage_vulnerabilities),
      damageResistances: emptyToNull(raw.damage_resistances),
      damageImmunities: emptyToNull(raw.damage_immunities),
      conditionImmunities: emptyToNull(raw.condition_immunities),
      specialAbilities: mapActions(raw.special_abilities),
      actions: mapActions(raw.actions),
      legendaryActions: mapActions(raw.legendary_actions),
    };
  }

  private collectSaves(
    raw: Open5eMonsterResult,
  ): Partial<Record<AbilityName, number>> {
    const result: Partial<Record<AbilityName, number>> = {};
    for (const [ability, field] of SAVE_FIELDS) {
      const value = raw[field];
      if (typeof value === "number") {
        result[ability] = value;
      }
    }
    return result;
  }

  private async getOrNull<TResponse>(path: string): Promise<TResponse | null> {
    try {
      return await this.getJson<TResponse>(path);
    } catch (error) {
      if (error instanceof ProviderRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

function emptyToNull(value: string | null): string | null {
  return value && value.trim() !== "" ? value : null;
}

function mapActions(actions: Open5eActionResult[] | null): SrdMonsterAction[] {
  if (!actions) {
    return [];
  }
  return actions.map((action) => ({
    name: action.name,
    description: action.desc,
  }));
}
