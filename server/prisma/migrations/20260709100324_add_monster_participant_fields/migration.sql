-- AlterTable
ALTER TABLE "encounter_participants" ADD COLUMN     "abilities" JSONB,
ADD COLUMN     "challenge_rating" DOUBLE PRECISION,
ADD COLUMN     "condition_immunities" TEXT,
ADD COLUMN     "damage_immunities" TEXT,
ADD COLUMN     "damage_resistances" TEXT,
ADD COLUMN     "damage_vulnerabilities" TEXT,
ADD COLUMN     "resources" JSONB,
ADD COLUMN     "senses" TEXT,
ADD COLUMN     "speed" TEXT;
