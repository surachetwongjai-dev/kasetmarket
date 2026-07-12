-- CreateTable
CREATE TABLE "PriceItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "mocProductId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceEntry" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "priceMin" DECIMAL(65,30) NOT NULL,
    "priceMax" DECIMAL(65,30),
    "note" TEXT,

    CONSTRAINT "PriceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceItem_slug_key" ON "PriceItem"("slug");

-- CreateIndex
CREATE INDEX "PriceItem_active_category_order_idx" ON "PriceItem"("active", "category", "order");

-- CreateIndex
CREATE INDEX "PriceEntry_itemId_date_idx" ON "PriceEntry"("itemId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PriceEntry_itemId_date_key" ON "PriceEntry"("itemId", "date");

-- AddForeignKey
ALTER TABLE "PriceEntry" ADD CONSTRAINT "PriceEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PriceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

