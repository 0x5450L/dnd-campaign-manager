/*
  Warnings:

  - The `status` column on the `campaign_invites` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `campaign_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `level` on the `characters` table. All the data in the column will be lost.
  - The `type` column on the `characters` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CharacterType" AS ENUM ('player', 'npc', 'monster');

-- CreateEnum
CREATE TYPE "CampaignMemberRole" AS ENUM ('dm', 'player');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "AbilityName" AS ENUM ('str', 'dex', 'con', 'int', 'wis', 'cha');

-- CreateEnum
CREATE TYPE "Alignment" AS ENUM ('lawful_good', 'neutral_good', 'chaotic_good', 'lawful_neutral', 'true_neutral', 'chaotic_neutral', 'lawful_evil', 'neutral_evil', 'chaotic_evil');

-- CreateEnum
CREATE TYPE "HitDiceType" AS ENUM ('d6', 'd8', 'd10', 'd12');

-- AlterTable
ALTER TABLE "campaign_invites" DROP COLUMN "status",
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "campaign_members" DROP COLUMN "role",
ADD COLUMN     "role" "CampaignMemberRole" NOT NULL DEFAULT 'player';

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "level",
ADD COLUMN     "alignment" "Alignment",
ADD COLUMN     "armorClass" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "background" TEXT,
ADD COLUMN     "currentHp" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "deathSaveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deathSaveSuccesses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hitDiceType" "HitDiceType" NOT NULL DEFAULT 'd8',
ADD COLUMN     "hitDiceUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inspiration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxHp" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "speed" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "tempHp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usesShield" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "type",
ADD COLUMN     "type" "CharacterType" NOT NULL DEFAULT 'player';

-- CreateTable
CREATE TABLE "ability_scores" (
    "id" TEXT NOT NULL,
    "name" "AbilityName" NOT NULL,
    "score" INTEGER NOT NULL,
    "saveThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "character_id" TEXT NOT NULL,

    CONSTRAINT "ability_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficient" BOOLEAN NOT NULL DEFAULT false,
    "character_id" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attacks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "damage" TEXT NOT NULL,
    "attackBonus" INTEGER NOT NULL,
    "notes" TEXT,
    "character_id" TEXT NOT NULL,

    CONSTRAINT "attacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ability_scores_character_id_name_key" ON "ability_scores"("character_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_character_id_name_key" ON "skills"("character_id", "name");

-- AddForeignKey
ALTER TABLE "ability_scores" ADD CONSTRAINT "ability_scores_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attacks" ADD CONSTRAINT "attacks_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
