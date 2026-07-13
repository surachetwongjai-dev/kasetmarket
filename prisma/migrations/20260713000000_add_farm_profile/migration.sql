-- CreateTable
CREATE TABLE "FarmProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "farmTypes" TEXT[],
    "products" TEXT,
    "sizeRai" INTEGER,
    "province" TEXT,
    "district" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProfileImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "FarmProfileImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmProfile_userId_key" ON "FarmProfile"("userId");

-- CreateIndex
CREATE INDEX "FarmProfileImage_profileId_idx" ON "FarmProfileImage"("profileId");

-- AddForeignKey
ALTER TABLE "FarmProfile" ADD CONSTRAINT "FarmProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmProfileImage" ADD CONSTRAINT "FarmProfileImage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FarmProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
