-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'paused', 'ended');

-- CreateEnum
CREATE TYPE "EncounterStatus" AS ENUM ('active', 'ended');

-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('pc', 'npc', 'monster');

-- CreateEnum
CREATE TYPE "DiceRollMode" AS ENUM ('normal', 'advantage', 'disadvantage');

-- CreateTable
CREATE TABLE "campaign_sessions" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "title" TEXT,
    "summary" TEXT,
    "notes" TEXT,
    "campaign_id" TEXT NOT NULL,

    CONSTRAINT "campaign_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounters" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" "EncounterStatus" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "round" INTEGER NOT NULL DEFAULT 1,
    "currentTurnIndex" INTEGER NOT NULL DEFAULT 0,
    "campaign_session_id" TEXT NOT NULL,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_participants" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "character_id" TEXT,
    "type" "ParticipantType" NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "max_hp" INTEGER NOT NULL,
    "armor_class" INTEGER NOT NULL,
    "attacks" JSONB NOT NULL DEFAULT '[]',
    "current_hp" INTEGER NOT NULL,
    "temp_hp" INTEGER NOT NULL DEFAULT 0,
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "death_save_successes" INTEGER NOT NULL DEFAULT 0,
    "death_save_failures" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encounter_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dice_rolls" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "character_id" TEXT,
    "formula" TEXT NOT NULL,
    "mode" "DiceRollMode" NOT NULL DEFAULT 'normal',
    "resultByDie" JSONB NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "dice_rolls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "encounter_participants_encounter_id_sort_order_idx" ON "encounter_participants"("encounter_id", "sort_order");

-- CreateIndex
CREATE INDEX "dice_rolls_campaign_session_id_created_at_idx" ON "dice_rolls"("campaign_session_id", "created_at");

-- AddForeignKey
ALTER TABLE "campaign_sessions" ADD CONSTRAINT "campaign_sessions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_campaign_session_id_fkey" FOREIGN KEY ("campaign_session_id") REFERENCES "campaign_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_participants" ADD CONSTRAINT "encounter_participants_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_participants" ADD CONSTRAINT "encounter_participants_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_campaign_session_id_fkey" FOREIGN KEY ("campaign_session_id") REFERENCES "campaign_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
