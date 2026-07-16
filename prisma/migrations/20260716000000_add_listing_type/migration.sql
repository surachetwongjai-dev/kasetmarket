-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SELL', 'BUY');

-- AlterTable: ประกาศเดิมทั้งหมดเป็น SELL (ค่าเริ่มต้น) — additive ไม่กระทบข้อมูลเดิม
ALTER TABLE "Listing" ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'SELL';

-- CreateIndex: filter ขาย/ต้องการซื้อ + เรียงใหม่สุด
CREATE INDEX "Listing_listingType_status_createdAt_idx" ON "Listing"("listingType", "status", "createdAt");
