// Queries ของประกาศ — ฝั่ง dashboard เห็นทุกสถานะ (ของตัวเองเท่านั้น),
// ฝั่ง public ต้อง filter ACTIVE + ยังไม่หมดอายุ เสมอ (CLAUDE.md §8)

import type { Prisma } from "@prisma/client";
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

// ---------- public (M6) ----------

export const LISTINGS_PAGE_SIZE = 24;

/** เงื่อนไขพื้นฐานของประกาศที่แสดงต่อสาธารณะ */
const PUBLIC_WHERE = {
  status: "ACTIVE",
  expiresAt: { gt: new Date(0) }, // แทนที่ด้วยเวลาจริงตอน query (ดู publicWhere())
} satisfies Prisma.ListingWhereInput;

function publicWhere(): Prisma.ListingWhereInput {
  return { ...PUBLIC_WHERE, expiresAt: { gt: new Date() } };
}

export type PublicListingsParams = {
  q?: string;
  category?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "cheapest";
  page?: number;
};

export async function getPublicListings(params: PublicListingsParams) {
  const {
    q,
    category,
    province,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
  } = params;

  const where: Prisma.ListingWhereInput = {
    ...publicWhere(),
    ...(category ? { category } : {}),
    ...(province ? { province } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
    // ค้นหาข้อความ: ILIKE บน title/description — ใช้ trigram GIN index (pg_trgm)
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy:
        sort === "cheapest"
          ? [{ price: "asc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
      skip: (page - 1) * LISTINGS_PAGE_SIZE,
      take: LISTINGS_PAGE_SIZE,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / LISTINGS_PAGE_SIZE)),
  };
}

export async function getActiveListingBySlug(slug: string) {
  return prisma.listing.findFirst({
    where: { ...publicWhere(), slug },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          province: true,
          verified: true,
          createdAt: true,
        },
      },
    },
  });
}

/** ประกาศใกล้เคียง: หมวดเดียวกัน จังหวัดเดียวกันก่อน แล้วเติมด้วยหมวดเดียวกันจังหวัดอื่น */
export async function getRelatedListings(listing: {
  id: string;
  category: string;
  province: string;
}) {
  const LIMIT = 4;
  const base = {
    ...publicWhere(),
    category: listing.category,
    id: { not: listing.id },
  };

  const sameProvince = await prisma.listing.findMany({
    where: { ...base, province: listing.province },
    orderBy: { createdAt: "desc" },
    take: LIMIT,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
  if (sameProvince.length >= LIMIT) return sameProvince;

  const others = await prisma.listing.findMany({
    where: {
      ...base,
      province: { not: listing.province },
    },
    orderBy: { createdAt: "desc" },
    take: LIMIT - sameProvince.length,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
  return [...sameProvince, ...others];
}

// ---------- หน้าแรก (M9) ----------

/** ประกาศเด่นสำหรับหน้าแรก */
export async function getFeaturedListings(limit = 4) {
  return prisma.listing.findMany({
    where: { ...publicWhere(), featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
}

/** ประกาศล่าสุดสำหรับหน้าแรก */
export async function getLatestListings(limit = 12) {
  return prisma.listing.findMany({
    where: publicWhere(),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
}

// ---------- โปรไฟล์ผู้ขาย (M9) ----------

export async function getSellerProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      province: true,
      verified: true,
      createdAt: true,
    },
  });
}

/** ประกาศ ACTIVE ทั้งหมดของผู้ขาย (โปรไฟล์สาธารณะ) */
export async function getSellerActiveListings(sellerId: string) {
  return prisma.listing.findMany({
    where: { ...publicWhere(), sellerId },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
}

/** slug ประกาศ ACTIVE ทั้งหมด (sitemap) */
export async function getAllActiveListingSlugs() {
  return prisma.listing.findMany({
    where: publicWhere(),
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}
