/*
  Warnings:

  - A unique constraint covering the columns `[dmId,name]` on the table `campaigns` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "campaigns_dmId_name_key" ON "campaigns"("dmId", "name");
