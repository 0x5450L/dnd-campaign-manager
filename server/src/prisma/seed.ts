import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import type { AbilityName, Alignment, HitDiceType } from "@prisma/client";
import type { Ability, ResourcePool } from "@dnd/shared/types/abilities";
import type { SpellSlotLevel } from "@dnd/shared/types/dnd";
import prisma from "../services/prisma";

const DEMO_PASSWORD = "demo1234";

const DEMO_ACCOUNTS = [
  { email: "dm@demo.local", displayName: "Ravenna the Keeper" },
  { email: "mira@demo.local", displayName: "Mira Silverbrook" },
  { email: "borin@demo.local", displayName: "Borin Stonefist" },
  { email: "eli@demo.local", displayName: "Eli Ashvane" },
] as const;

const CAMPAIGN_NAME = "The Sunken Crown";

type AbilityScoreSeed = Record<AbilityName, number>;

type CharacterSeed = {
  ownerEmail: string;
  name: string;
  race: string;
  characterClass: string;
  subclass: string;
  background: string;
  alignment: Alignment;
  experience: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  usesShield: boolean;
  hitDiceType: HitDiceType;
  speed: number;
  scores: AbilityScoreSeed;
  saveProficiencies: AbilityName[];
  skills: string[];
  attacks: { name: string; damage: string; attackBonus: number; notes?: string }[];
  spellSlots?: SpellSlotLevel[];
  abilities?: Ability[];
  resources?: ResourcePool[];
  notes: string;
};

const CHARACTERS: CharacterSeed[] = [
  {
    ownerEmail: "mira@demo.local",
    name: "Mira Silverbrook",
    race: "Half-Elf",
    characterClass: "Wizard",
    subclass: "School of Evocation",
    background: "Sage",
    alignment: "neutral_good",
    experience: 6500,
    maxHp: 27,
    currentHp: 21,
    armorClass: 12,
    usesShield: false,
    hitDiceType: "d6",
    speed: 30,
    scores: { str: 8, dex: 14, con: 14, int: 17, wis: 12, cha: 13 },
    saveProficiencies: ["int", "wis"],
    skills: ["Arcana", "History", "Investigation", "Perception"],
    attacks: [
      { name: "Quarterstaff", damage: "1d6", attackBonus: 1 },
      { name: "Fire Bolt", damage: "2d10 fire", attackBonus: 6, notes: "120 ft." },
    ],
    spellSlots: [
      { level: 1, total: 4, used: 1 },
      { level: 2, total: 3, used: 0 },
      { level: 3, total: 2, used: 1 },
    ],
    abilities: [
      {
        id: "mira-sculpt",
        name: "Sculpt Spells",
        description:
          "Chosen allies automatically succeed their saves against her evocation spells and take no damage.",
        activation: "passive",
        cost: null,
      },
      {
        id: "mira-fireball",
        name: "Fireball",
        description: "A roaring sphere of flame, 8d6 fire damage in a 20-foot radius.",
        activation: "action",
        cost: { type: "spellSlot", level: 3 },
      },
      {
        id: "mira-recovery",
        name: "Arcane Recovery",
        description: "Recover expended spell slots on a short rest, once per day.",
        activation: "free",
        cost: { type: "perDay", max: 1, remaining: 1 },
      },
    ],
    notes:
      "Came to the coast chasing a rumour about the drowned city. Keeps a waterlogged journal she refuses to let anyone read.",
  },
  {
    ownerEmail: "borin@demo.local",
    name: "Borin Stonefist",
    race: "Mountain Dwarf",
    characterClass: "Fighter",
    subclass: "Battle Master",
    background: "Soldier",
    alignment: "lawful_neutral",
    experience: 6500,
    maxHp: 44,
    currentHp: 31,
    armorClass: 18,
    usesShield: true,
    hitDiceType: "d10",
    speed: 25,
    scores: { str: 17, dex: 12, con: 16, int: 10, wis: 13, cha: 8 },
    saveProficiencies: ["str", "con"],
    skills: ["Athletics", "Intimidation", "Perception", "Survival"],
    attacks: [
      { name: "Warhammer", damage: "1d8+3", attackBonus: 6, notes: "Versatile 1d10" },
      { name: "Handaxe", damage: "1d6+3", attackBonus: 6, notes: "Thrown 20/60" },
    ],
    abilities: [
      {
        id: "borin-second-wind",
        name: "Second Wind",
        description: "Regain 1d10 + fighter level hit points as a bonus action.",
        activation: "bonus",
        cost: { type: "perDay", max: 1, remaining: 0 },
      },
      {
        id: "borin-action-surge",
        name: "Action Surge",
        description: "Take one additional action on your turn.",
        activation: "free",
        cost: { type: "perDay", max: 1, remaining: 1 },
      },
      {
        id: "borin-trip",
        name: "Trip Attack",
        description: "Add a superiority die to damage and knock the target prone.",
        activation: "free",
        cost: { type: "pool", pool: "superiority", amount: 1 },
      },
    ],
    resources: [
      {
        key: "superiority",
        label: "Superiority Dice",
        max: 4,
        remaining: 2,
        resetOn: "shortRest",
      },
    ],
    notes:
      "Twenty years with the harbour guard. Signed on because the pay was good and the questions were few.",
  },
  {
    ownerEmail: "eli@demo.local",
    name: "Eli Ashvane",
    race: "Human",
    characterClass: "Rogue",
    subclass: "Arcane Trickster",
    background: "Urchin",
    alignment: "chaotic_good",
    experience: 6500,
    maxHp: 32,
    currentHp: 32,
    armorClass: 15,
    usesShield: false,
    hitDiceType: "d8",
    speed: 30,
    scores: { str: 10, dex: 18, con: 13, int: 14, wis: 12, cha: 14 },
    saveProficiencies: ["dex", "int"],
    skills: ["Acrobatics", "Deception", "Sleight of Hand", "Stealth", "Perception"],
    attacks: [
      { name: "Rapier", damage: "1d8+4", attackBonus: 7, notes: "Finesse" },
      { name: "Shortbow", damage: "1d6+4", attackBonus: 7, notes: "80/320" },
    ],
    spellSlots: [{ level: 1, total: 3, used: 0 }],
    abilities: [
      {
        id: "eli-sneak",
        name: "Sneak Attack",
        description: "Once per turn, add 3d6 damage when you have advantage or an ally is adjacent.",
        activation: "passive",
        cost: null,
      },
      {
        id: "eli-cunning",
        name: "Cunning Action",
        description: "Dash, Disengage or Hide as a bonus action.",
        activation: "bonus",
        cost: null,
      },
    ],
    notes: "Grew up in the dock warrens. Claims the guild owes him money; nobody has verified this.",
  },
];

type MonsterSeed = {
  name: string;
  creatureType: string;
  challengeRating: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  speed: number;
  scores: AbilityScoreSeed;
  attacks: { name: string; damage: string; attackBonus: number; notes?: string }[];
  abilities?: Ability[];
  notes: string;
};

const MONSTERS: MonsterSeed[] = [
  {
    name: "Sahuagin Raider",
    creatureType: "humanoid",
    challengeRating: 0.5,
    maxHp: 22,
    currentHp: 22,
    armorClass: 12,
    speed: 30,
    scores: { str: 13, dex: 11, con: 12, int: 12, wis: 13, cha: 9 },
    attacks: [
      { name: "Spear", damage: "1d6+1", attackBonus: 3 },
      { name: "Bite", damage: "1d4+1", attackBonus: 3 },
    ],
    notes: "Comes up the tide channels at night.",
  },
  {
    name: "Drowned Acolyte",
    creatureType: "undead",
    challengeRating: 2,
    maxHp: 39,
    currentHp: 39,
    armorClass: 13,
    speed: 20,
    scores: { str: 14, dex: 10, con: 16, int: 8, wis: 14, cha: 10 },
    attacks: [{ name: "Brine-soaked Mace", damage: "1d6+2", attackBonus: 4 }],
    abilities: [
      {
        id: "acolyte-tide",
        name: "Call the Tide",
        description: "A wave crashes through the chamber, 2d8 bludgeoning in a 15-foot line.",
        activation: "action",
        cost: { type: "recharge", threshold: 5, charged: true },
      },
    ],
    notes: "Still wearing the sigil of a temple that sank two centuries ago.",
  },
  {
    name: "Reef Lurker",
    creatureType: "aberration",
    challengeRating: 3,
    maxHp: 52,
    currentHp: 52,
    armorClass: 15,
    speed: 20,
    scores: { str: 16, dex: 14, con: 15, int: 6, wis: 12, cha: 5 },
    attacks: [
      { name: "Tentacle", damage: "2d6+3", attackBonus: 5, notes: "Grapple DC 13" },
    ],
    abilities: [
      {
        id: "lurker-ink",
        name: "Ink Cloud",
        description: "Heavily obscures a 20-foot cube centred on the lurker.",
        activation: "action",
        cost: { type: "recharge", threshold: 6, charged: true },
      },
    ],
    notes: "Waits in the flooded nave. The party has not seen it yet.",
  },
];

const abilityScoreRows = (scores: AbilityScoreSeed, saves: AbilityName[]) =>
  (Object.entries(scores) as [AbilityName, number][]).map(([name, score]) => ({
    name,
    score,
    saveThrowProficient: saves.includes(name),
  }));

/**
 * Members, characters and invites hold a restricting foreign key to their campaign,
 * so they have to go before it; sessions, encounters and dice rolls cascade on their
 * own. Deleting by campaign rather than by owner also clears whatever a visitor left
 * behind in the demo campaign.
 */
const removeDemoData = async () => {
  const emails = DEMO_ACCOUNTS.map((account) => account.email);
  const users = await prisma.user.findMany({
    where: { email: { in: [...emails] } },
    select: { id: true },
  });

  if (users.length === 0) return;

  const userIds = users.map((user) => user.id);
  const campaigns = await prisma.campaign.findMany({
    where: { dmId: { in: userIds } },
    select: { id: true },
  });
  const campaignIds = campaigns.map((campaign) => campaign.id);

  if (campaignIds.length > 0) {
    await prisma.campaignInvite.deleteMany({ where: { campaignId: { in: campaignIds } } });
    await prisma.campaignMember.deleteMany({ where: { campaignId: { in: campaignIds } } });
    await prisma.character.deleteMany({ where: { campaignId: { in: campaignIds } } });
    await prisma.campaign.deleteMany({ where: { id: { in: campaignIds } } });
  }

  await prisma.campaignMember.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.character.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
};

const seed = async () => {
  await removeDemoData();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = new Map<string, string>();

  for (const account of DEMO_ACCOUNTS) {
    const user = await prisma.user.create({
      data: { email: account.email, passwordHash, displayName: account.displayName },
    });
    users.set(account.email, user.id);
  }

  const dmId = users.get("dm@demo.local")!;

  const campaign = await prisma.campaign.create({
    data: {
      name: CAMPAIGN_NAME,
      description:
        "A drowned city surfaces once a century, and the tide is already going out. The party has eleven days.",
      setting: "Faerûn — the Sword Coast, somewhere past Baldur's Gate",
      dmId,
      members: {
        create: [
          { userId: dmId, role: "dm" },
          ...DEMO_ACCOUNTS.filter((account) => account.email !== "dm@demo.local").map(
            (account) => ({ userId: users.get(account.email)!, role: "player" as const }),
          ),
        ],
      },
    },
  });

  const characterIds = new Map<string, string>();

  for (const seedCharacter of CHARACTERS) {
    const character = await prisma.character.create({
      data: {
        campaignId: campaign.id,
        userId: users.get(seedCharacter.ownerEmail)!,
        type: "player",
        name: seedCharacter.name,
        race: seedCharacter.race,
        characterClass: seedCharacter.characterClass,
        subclass: seedCharacter.subclass,
        background: seedCharacter.background,
        alignment: seedCharacter.alignment,
        experience: seedCharacter.experience,
        maxHp: seedCharacter.maxHp,
        currentHp: seedCharacter.currentHp,
        armorClass: seedCharacter.armorClass,
        usesShield: seedCharacter.usesShield,
        hitDiceType: seedCharacter.hitDiceType,
        speed: seedCharacter.speed,
        notes: seedCharacter.notes,
        spellSlots: seedCharacter.spellSlots ?? undefined,
        abilities: seedCharacter.abilities ?? undefined,
        resources: seedCharacter.resources ?? undefined,
        abilityScores: {
          create: abilityScoreRows(seedCharacter.scores, seedCharacter.saveProficiencies),
        },
        skills: {
          create: seedCharacter.skills.map((name) => ({ name, proficient: true })),
        },
        attacks: { create: seedCharacter.attacks },
      },
    });
    characterIds.set(seedCharacter.name, character.id);
  }

  for (const monster of MONSTERS) {
    await prisma.character.create({
      data: {
        campaignId: campaign.id,
        userId: dmId,
        type: "monster",
        name: monster.name,
        race: monster.creatureType,
        maxHp: monster.maxHp,
        currentHp: monster.currentHp,
        armorClass: monster.armorClass,
        speed: monster.speed,
        notes: monster.notes,
        abilities: monster.abilities ?? undefined,
        abilityScores: { create: abilityScoreRows(monster.scores, []) },
        attacks: { create: monster.attacks },
        creatureProfile: {
          create: {
            challengeRating: monster.challengeRating,
            creatureType: monster.creatureType,
          },
        },
      },
    });
  }

  const session = await prisma.campaignSession.create({
    data: {
      campaignId: campaign.id,
      number: 7,
      status: "active",
      title: "Into the Flooded Nave",
      summary:
        "The party forced the sea doors and found the nave half full of black water. Something moved beneath it.",
      notes: "Eleven days until the city sinks again.",
    },
  });

  const encounter = await prisma.encounter.create({
    data: {
      campaignSessionId: session.id,
      name: "Ambush in the Nave",
      status: "active",
      round: 2,
    },
  });

  const participants = [
    {
      type: "pc" as const,
      name: "Mira Silverbrook",
      characterId: characterIds.get("Mira Silverbrook")!,
      sortOrder: 0,
      maxHp: 27,
      currentHp: 21,
      armorClass: 12,
      isVisible: true,
      conditions: [],
    },
    {
      type: "pc" as const,
      name: "Eli Ashvane",
      characterId: characterIds.get("Eli Ashvane")!,
      sortOrder: 1,
      maxHp: 32,
      currentHp: 32,
      armorClass: 15,
      isVisible: true,
      conditions: [],
    },
    {
      type: "monster" as const,
      name: "Sahuagin Raider",
      characterId: null,
      sortOrder: 2,
      maxHp: 22,
      currentHp: 9,
      armorClass: 12,
      isVisible: true,
      conditions: ["prone"],
    },
    {
      type: "pc" as const,
      name: "Borin Stonefist",
      characterId: characterIds.get("Borin Stonefist")!,
      sortOrder: 3,
      maxHp: 44,
      currentHp: 31,
      armorClass: 18,
      isVisible: true,
      conditions: [],
    },
    {
      type: "monster" as const,
      name: "Drowned Acolyte",
      characterId: null,
      sortOrder: 4,
      maxHp: 39,
      currentHp: 39,
      armorClass: 13,
      isVisible: true,
      conditions: [],
    },
    {
      type: "monster" as const,
      name: "Reef Lurker",
      characterId: null,
      sortOrder: 5,
      maxHp: 52,
      currentHp: 52,
      armorClass: 15,
      isVisible: false,
      conditions: [],
    },
  ];

  const created = [];
  for (const participant of participants) {
    created.push(
      await prisma.encounterParticipant.create({
        data: { encounterId: encounter.id, ...participant },
      }),
    );
  }

  await prisma.encounter.update({
    where: { id: encounter.id },
    data: { currentParticipantId: created[2].id },
  });

  console.log(
    [
      "Seeded demo data:",
      `  campaign      ${CAMPAIGN_NAME}`,
      `  accounts      ${DEMO_ACCOUNTS.map((a) => a.email).join(", ")}`,
      `  password      ${DEMO_PASSWORD}`,
      `  characters    ${CHARACTERS.length} player, ${MONSTERS.length} monster`,
      `  encounter     ${participants.length} participants, one hidden from players`,
    ].join("\n"),
  );
};

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
