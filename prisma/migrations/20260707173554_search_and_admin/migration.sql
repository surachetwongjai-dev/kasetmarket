-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "rejectReason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false;


-- ค้นหาไทยด้วย trigram (pg_trgm) — ILIKE บน title/description ใช้ index นี้
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Listing_title_trgm_idx" ON "Listing" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Listing_description_trgm_idx" ON "Listing" USING GIN ("description" gin_trgm_ops);
