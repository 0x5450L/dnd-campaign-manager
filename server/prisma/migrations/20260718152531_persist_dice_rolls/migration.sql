/*
  Warnings:

  - You are about to drop the column `character_id` on the `dice_rolls` table. All the data in the column will be lost.
  - You are about to drop the column `formula` on the `dice_rolls` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `dice_rolls` table. All the data in the column will be lost.
  - You are about to drop the column `resultByDie` on the `dice_rolls` table. All the data in the column will be lost.
  - Added the required column `actor_name` to the `dice_rolls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expression` to the `dice_rolls` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dice_rolls" DROP CONSTRAINT "dice_rolls_character_id_fkey";

-- AlterTable
ALTER TABLE "dice_rolls" DROP COLUMN "character_id",
DROP COLUMN "formula",
DROP COLUMN "mode",
DROP COLUMN "resultByDie",
ADD COLUMN     "actor_name" TEXT NOT NULL,
ADD COLUMN     "crit_fail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "crit_success" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expression" TEXT NOT NULL;

-- DropEnum
DROP TYPE "DiceRollMode";
