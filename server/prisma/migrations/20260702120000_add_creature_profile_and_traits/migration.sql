-- CreateEnum
CREATE TYPE "CreatureTraitKind" AS ENUM ('trait', 'legendary_action');

-- CreateTable
CREATE TABLE "creature_profiles" (
    "id" TEXT NOT NULL,
    "challenge_rating" DOUBLE PRECISION,
    "size" TEXT,
    "creature_type" TEXT,
    "senses" TEXT,
    "languages" TEXT,
    "damage_vulnerabilities" TEXT,
    "damage_resistances" TEXT,
    "damage_immunities" TEXT,
    "condition_immunities" TEXT,
    "character_id" TEXT NOT NULL,

    CONSTRAINT "creature_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creature_traits" (
    "id" TEXT NOT NULL,
    "kind" "CreatureTraitKind" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,

    CONSTRAINT "creature_traits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creature_profiles_character_id_key" ON "creature_profiles"("character_id");

-- AddForeignKey
ALTER TABLE "creature_profiles" ADD CONSTRAINT "creature_profiles_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creature_traits" ADD CONSTRAINT "creature_traits_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "creature_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
