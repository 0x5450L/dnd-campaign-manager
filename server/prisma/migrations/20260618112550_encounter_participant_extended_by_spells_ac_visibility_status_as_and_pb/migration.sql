-- DropForeignKey
ALTER TABLE "dice_rolls" DROP CONSTRAINT "dice_rolls_character_id_fkey";

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
