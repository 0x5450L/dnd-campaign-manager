import { describe, expect, it, vi } from "vitest";
import { SRD_CATEGORY, SRD_SOURCE } from "@dnd/shared/constants/srd";
import type { SrdCategory, SrdSource, SrdSpell } from "@dnd/shared/dto/srd";
import type { ContentProvider } from "./contentProvider";
import { NoProviderAvailableError } from "./providerErrors";
import { ProviderRouter } from "./providerRouter";
import type { ProviderRouting } from "./routing";

type ProviderStub = {
  id: SrdSource;
  categories?: SrdCategory[];
  spell?: () => Promise<SrdSpell | null>;
};

const spell = (slug: string) => ({ slug, name: slug }) as SrdSpell;

const stubProvider = ({
  id,
  categories = [SRD_CATEGORY.Spell],
  spell: getSpell = async () => null,
}: ProviderStub): ContentProvider =>
  ({
    id,
    capabilities: new Set<SrdCategory>(categories),
    getSpell,
    searchSpells: async () => ({ results: [], total: 0 }),
    getCreature: async () => null,
    searchCreatures: async () => ({ results: [], total: 0 }),
    getItem: async () => null,
    searchItems: async () => ({ results: [], total: 0 }),
    getCondition: async () => null,
    searchConditions: async () => ({ results: [], total: 0 }),
  }) as unknown as ContentProvider;

const spellRouting = (sources: SrdSource[]): ProviderRouting => ({
  [SRD_CATEGORY.Spell]: sources,
  [SRD_CATEGORY.Monster]: [],
  [SRD_CATEGORY.Item]: [],
  [SRD_CATEGORY.Condition]: [],
});

const twoSourceRouting = spellRouting([SRD_SOURCE.Dnd5eApi, SRD_SOURCE.Open5e]);

describe("ProviderRouter detail lookups", () => {
  it("returns the first provider's hit without consulting the second", () => {
    const second = vi.fn(async () => spell("fireball"));
    const router = new ProviderRouter(
      [
        stubProvider({ id: SRD_SOURCE.Dnd5eApi, spell: async () => spell("fireball") }),
        stubProvider({ id: SRD_SOURCE.Open5e, spell: second }),
      ],
      twoSourceRouting,
    );

    return router.getSpell("fireball").then((result) => {
      expect(result).toEqual(spell("fireball"));
      expect(second).not.toHaveBeenCalled();
    });
  });

  it("falls through to the next source when the first has no such slug", async () => {
    const router = new ProviderRouter(
      [
        stubProvider({ id: SRD_SOURCE.Dnd5eApi, spell: async () => null }),
        stubProvider({ id: SRD_SOURCE.Open5e, spell: async () => spell("gate-seal") }),
      ],
      twoSourceRouting,
    );

    await expect(router.getSpell("gate-seal")).resolves.toEqual(spell("gate-seal"));
  });

  it("falls through when the first source throws", async () => {
    const router = new ProviderRouter(
      [
        stubProvider({
          id: SRD_SOURCE.Dnd5eApi,
          spell: async () => {
            throw new Error("upstream 503");
          },
        }),
        stubProvider({ id: SRD_SOURCE.Open5e, spell: async () => spell("gate-seal") }),
      ],
      twoSourceRouting,
    );

    await expect(router.getSpell("gate-seal")).resolves.toEqual(spell("gate-seal"));
  });

  it("returns null when every source was reached and none knew the slug", async () => {
    const router = new ProviderRouter(
      [
        stubProvider({ id: SRD_SOURCE.Dnd5eApi }),
        stubProvider({ id: SRD_SOURCE.Open5e }),
      ],
      twoSourceRouting,
    );

    await expect(router.getSpell("nonsense")).resolves.toBeNull();
  });

  it("throws when no source could be reached at all", async () => {
    const unreachable = async () => {
      throw new Error("network down");
    };
    const router = new ProviderRouter(
      [
        stubProvider({ id: SRD_SOURCE.Dnd5eApi, spell: unreachable }),
        stubProvider({ id: SRD_SOURCE.Open5e, spell: unreachable }),
      ],
      twoSourceRouting,
    );

    await expect(router.getSpell("fireball")).rejects.toBeInstanceOf(
      NoProviderAvailableError,
    );
  });

  it("throws when no registered provider serves the category", async () => {
    const router = new ProviderRouter([], twoSourceRouting);
    await expect(router.getSpell("fireball")).rejects.toBeInstanceOf(
      NoProviderAvailableError,
    );
  });

  it("skips a routed provider that lacks the capability", async () => {
    const router = new ProviderRouter(
      [
        stubProvider({
          id: SRD_SOURCE.Dnd5eApi,
          categories: [SRD_CATEGORY.Item],
          spell: async () => spell("wrong-source"),
        }),
        stubProvider({ id: SRD_SOURCE.Open5e, spell: async () => spell("fireball") }),
      ],
      twoSourceRouting,
    );

    await expect(router.getSpell("fireball")).resolves.toEqual(spell("fireball"));
  });

  it("honours routing order rather than registration order", async () => {
    const router = new ProviderRouter(
      [
        stubProvider({ id: SRD_SOURCE.Dnd5eApi, spell: async () => spell("from-dnd5eapi") }),
        stubProvider({ id: SRD_SOURCE.Open5e, spell: async () => spell("from-open5e") }),
      ],
      spellRouting([SRD_SOURCE.Open5e, SRD_SOURCE.Dnd5eApi]),
    );

    await expect(router.getSpell("fireball")).resolves.toEqual(spell("from-open5e"));
  });
});

describe("ProviderRouter search", () => {
  it("throws when no source can serve the category", async () => {
    const router = new ProviderRouter([], twoSourceRouting);
    await expect(router.searchSpells({})).rejects.toBeInstanceOf(NoProviderAvailableError);
  });
});

describe("ProviderRouter itemSources", () => {
  it("lists only registered providers that declare the item capability", () => {
    const router = new ProviderRouter(
      [
        stubProvider({ id: SRD_SOURCE.Open5e, categories: [SRD_CATEGORY.Item] }),
        stubProvider({ id: SRD_SOURCE.Open5eV2, categories: [SRD_CATEGORY.Spell] }),
      ],
      {
        ...twoSourceRouting,
        [SRD_CATEGORY.Item]: [SRD_SOURCE.Open5e, SRD_SOURCE.Open5eV2],
      },
    );

    expect(router.itemSources()).toEqual([SRD_SOURCE.Open5e]);
  });
});
