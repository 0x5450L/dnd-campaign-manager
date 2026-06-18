-- AlterTable
ALTER TABLE "encounter_participants" ADD COLUMN     "ac_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ability_scores" JSONB,
ADD COLUMN     "spell_slots" JSONB,
ADD COLUMN     "spell_ability" "AbilityName",
ADD COLUMN     "proficiency_bonus" INTEGER;
