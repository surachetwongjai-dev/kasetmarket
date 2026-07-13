-- CreateEnum
CREATE TYPE "MatchPostType" AS ENUM ('SUPPLY', 'DEMAND');

-- CreateEnum
CREATE TYPE "MatchPostStatus" AS ENUM ('PENDING', 'ACTIVE', 'MATCHED', 'EXPIRED', 'REJECTED');

-- CreateTable
CREATE TABLE "MatchPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "MatchPostType" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT,
    "quantity" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "priceNote" TEXT,
    "contactPhone" TEXT,
    "contactLine" TEXT,
    "status" "MatchPostStatus" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchPost_slug_key" ON "MatchPost"("slug");

-- CreateIndex
CREATE INDEX "MatchPost_type_category_province_status_idx" ON "MatchPost"("type", "category", "province", "status");

-- CreateIndex
CREATE INDEX "MatchPost_status_createdAt_idx" ON "MatchPost"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "MatchPost" ADD CONSTRAINT "MatchPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

