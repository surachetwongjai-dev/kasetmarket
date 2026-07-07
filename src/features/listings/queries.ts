// Queries ของประกาศฝั่ง dashboard (ของตัวเองเท่านั้น — เห็นได้ทุกสถานะ
// ตามข้อยกเว้นใน CLAUDE.md §8; หน้า public M6 ต้อง filter ACTIVE เสมอ)

import { prisma } from "@/lib/prisma";

export async function getMyListings(sellerId: string) {
  return prisma.listing.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });
}

export async function getMyListingForEdit(id: string, sellerId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!listing || listing.sellerId !== sellerId) return null;
  return listing;
}
