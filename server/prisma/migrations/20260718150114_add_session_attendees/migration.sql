-- CreateTable
CREATE TABLE "session_attendees" (
    "id" TEXT NOT NULL,
    "campaign_session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "session_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_attendees_user_id_left_at_idx" ON "session_attendees"("user_id", "left_at");

-- CreateIndex
CREATE INDEX "session_attendees_campaign_session_id_left_at_idx" ON "session_attendees"("campaign_session_id", "left_at");

-- AddForeignKey
ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_campaign_session_id_fkey" FOREIGN KEY ("campaign_session_id") REFERENCES "campaign_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
