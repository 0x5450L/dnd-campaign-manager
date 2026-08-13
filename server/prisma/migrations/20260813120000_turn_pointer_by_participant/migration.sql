-- AlterTable
ALTER TABLE "encounters" ADD COLUMN "current_participant_id" TEXT;

-- Backfill the pointer from the positional index of running encounters
UPDATE "encounters" e
SET "current_participant_id" = ordered."id"
FROM (
  SELECT
    "id",
    "encounter_id",
    ROW_NUMBER() OVER (
      PARTITION BY "encounter_id"
      ORDER BY "sort_order" DESC, "id" ASC
    ) - 1 AS "position"
  FROM "encounter_participants"
) ordered
WHERE ordered."encounter_id" = e."id"
  AND ordered."position" = e."currentTurnIndex"
  AND e."status" = 'active';

-- AlterTable
ALTER TABLE "encounters" DROP COLUMN "currentTurnIndex";

-- CreateIndex
CREATE UNIQUE INDEX "encounters_current_participant_id_key" ON "encounters"("current_participant_id");

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_current_participant_id_fkey" FOREIGN KEY ("current_participant_id") REFERENCES "encounter_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
