-- AlterTable
ALTER TABLE "reservation" ADD COLUMN     "region" TEXT;

-- CreateIndex
CREATE INDEX "reservation_region_idx" ON "reservation"("region");
