-- CreateTable
CREATE TABLE "campaign_invites" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "campaignId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_invites_token_key" ON "campaign_invites"("token");

-- AddForeignKey
ALTER TABLE "campaign_invites" ADD CONSTRAINT "campaign_invites_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
