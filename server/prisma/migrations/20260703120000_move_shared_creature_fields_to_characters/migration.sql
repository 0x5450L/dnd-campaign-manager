-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "condition_immunities" TEXT,
ADD COLUMN     "damage_immunities" TEXT,
ADD COLUMN     "damage_resistances" TEXT,
ADD COLUMN     "damage_vulnerabilities" TEXT,
ADD COLUMN     "languages" TEXT,
ADD COLUMN     "senses" TEXT,
ADD COLUMN     "size" TEXT;

-- CopyData
UPDATE "characters"
SET
  "size" = p."size",
  "senses" = p."senses",
  "languages" = p."languages",
  "damage_vulnerabilities" = p."damage_vulnerabilities",
  "damage_resistances" = p."damage_resistances",
  "damage_immunities" = p."damage_immunities",
  "condition_immunities" = p."condition_immunities"
FROM "creature_profiles" p
WHERE p."character_id" = "characters"."id";

-- AlterTable
ALTER TABLE "creature_profiles" DROP COLUMN "condition_immunities",
DROP COLUMN "damage_immunities",
DROP COLUMN "damage_resistances",
DROP COLUMN "damage_vulnerabilities",
DROP COLUMN "languages",
DROP COLUMN "senses",
DROP COLUMN "size";
