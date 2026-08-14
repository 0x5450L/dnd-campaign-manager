-- AlterTable
ALTER TABLE "characters" ALTER COLUMN "character_class" SET DEFAULT '';

-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "subclass" TEXT,
ADD COLUMN     "class_features" TEXT,
ADD COLUMN     "racial_traits" TEXT,
ADD COLUMN     "feats" TEXT,
ADD COLUMN     "armor_proficiencies" TEXT,
ADD COLUMN     "weapon_proficiencies" TEXT,
ADD COLUMN     "tool_proficiencies" TEXT;
