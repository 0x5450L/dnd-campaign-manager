/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `campaign_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `characters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `encounter_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `encounters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `generated_content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "campaign_members" DROP CONSTRAINT "campaign_members_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "campaign_members" DROP CONSTRAINT "campaign_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_dm_id_fkey";

-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_user_id_fkey";

-- DropForeignKey
ALTER TABLE "encounter_participants" DROP CONSTRAINT "encounter_participants_encounter_id_fkey";

-- DropForeignKey
ALTER TABLE "encounters" DROP CONSTRAINT "encounters_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "generated_content" DROP CONSTRAINT "generated_content_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_campaign_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_url";

-- DropTable
DROP TABLE "campaign_members";

-- DropTable
DROP TABLE "campaigns";

-- DropTable
DROP TABLE "characters";

-- DropTable
DROP TABLE "encounter_participants";

-- DropTable
DROP TABLE "encounters";

-- DropTable
DROP TABLE "generated_content";

-- DropTable
DROP TABLE "sessions";

-- DropEnum
DROP TYPE "CampaignRole";

-- DropEnum
DROP TYPE "ContentType";

-- DropEnum
DROP TYPE "EncounterStatus";

-- DropEnum
DROP TYPE "ParticipantType";
