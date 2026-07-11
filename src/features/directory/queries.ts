// Queries ของ directory ร้านค้า — ฝั่ง public แสดงเฉพาะ APPROVED เสมอ (CLAUDE.md §10)

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  listingCategoriesOfShop,
  shopCategoriesForListingCategory,
} from "@/config/shopCategories";
import { ARTICLE_CATEGORIES } from "@/config/articleCategories";

export const SHOPS_PAGE_SIZE = 24;

const APPROVED_WHERE = { status: "APPROVED" } satisfies Prisma.ShopWhereInput;

/** เรียงร้าน: featured ก่อน แล้วร้านใหม่ก่อน — ใช้ทุกหน้า list ให้ลำดับสม่ำเสมอ */
const SHOP_ORDER: Prisma.ShopOrderByWithRelationInput[] = [
  { featured: "desc" },
  { createdAt: "desc" },
];

const CARD_INCLUDE = {
  images: { orderBy: { order: "asc" as const }, take: 1 },
};

export type ShopSearchQuery = {
  q?: string;
  province?: string;
  category?: string; // value จาก config/shopCategories.ts
  page?: number;
};

/** หน้ารวม /ร้านค้า — ค้นหาชื่อร้าน + filter จังหวัด/หมวด (dynamic) */
export async function searchShops(params: ShopSearchQuery) {
  const { q, province, category, page = 1 } = params;

  const where: Prisma.ShopWhereInput = {
    ...APPROVED_WHERE,
    ...(province ? { province } : {}),
    ...(category ? { categories: { has: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.shop.count({ where }),
    prisma.shop.findMany({
      where,
      orderBy: SHOP_ORDER,
      skip: (page - 1) * SHOPS_PAGE_SIZE,
      take: SHOPS_PAGE_SIZE,
      include: CARD_INCLUDE,
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / SHOPS_PAGE_SIZE)),
  };
}

/** จังหวัดที่มีร้าน APPROVED + จำนวน (หน้ารวม, sitemap) */
export async function getProvincesWithShopCounts() {
  const groups = await prisma.shop.groupBy({
    by: ["province"],
    where: APPROVED_WHERE,
    _count: { _all: true },
  });
  return groups
    .map((g) => ({ province: g.province, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

/** ร้านทั้งหมดในจังหวัด (หน้า /ร้านค้า/[จังหวัด] — ISR) */
export async function getShopsByProvince(province: string) {
  return prisma.shop.findMany({
    where: { ...APPROVED_WHERE, province },
    orderBy: SHOP_ORDER,
    include: CARD_INCLUDE,
  });
}

/**
 * นับร้านต่อหมวดในจังหวัด — Shop.categories เป็น array จึง groupBy ตรงๆ ไม่ได้
 * นับใน JS (ร้านต่อจังหวัดอยู่หลักร้อย ไม่หนัก)
 */
export async function getCategoryCountsInProvince(province: string) {
  const rows = await prisma.shop.findMany({
    where: { ...APPROVED_WHERE, province },
    select: { categories: true },
  });
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const c of row.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return counts;
}

/** ร้านในจังหวัด+หมวด (หน้าดัก keyword หลัก — ISR) */
export async function getShopsByProvinceCategory(
  province: string,
  category: string,
) {
  return prisma.shop.findMany({
    where: { ...APPROVED_WHERE, province, categories: { has: category } },
    orderBy: SHOP_ORDER,
    include: CARD_INCLUDE,
  });
}

/** โปรไฟล์ร้าน (หน้า /ร้านค้า/.../[slug]) */
export async function getApprovedShopBySlug(slug: string) {
  return prisma.shop.findFirst({
    where: { ...APPROVED_WHERE, slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

// ---------- Cross-link สองทาง (D3) — ทุก query ผ่าน mapping ใน config/shopCategories.ts ----------

/** บล็อก "ร้านค้า-ตัวแทนจำหน่ายใกล้คุณ" บนหน้าประกาศ: หมวด mapping ตรง + จังหวัดเดียวกัน */
export async function getShopsForListing(
  listingCategory: string,
  province: string,
  limit = 4,
) {
  const shopCategories = shopCategoriesForListingCategory(listingCategory);
  if (shopCategories.length === 0) return [];
  return prisma.shop.findMany({
    where: {
      ...APPROVED_WHERE,
      province,
      categories: { hasSome: shopCategories },
    },
    orderBy: SHOP_ORDER,
    take: limit,
    include: CARD_INCLUDE,
  });
}

/** บล็อก "ประกาศขายในพื้นที่นี้" บนหน้าร้าน: ประกาศ ACTIVE หมวด mapping + จังหวัดเดียวกัน */
export async function getListingsNearShop(
  shop: { categories: string[]; province: string },
  limit = 4,
) {
  const categories = listingCategoriesOfShop(shop.categories);
  if (categories.length === 0) return [];
  return prisma.listing.findMany({
    // กติกา §8: ประกาศต่อสาธารณะต้อง ACTIVE + ยังไม่หมดอายุเสมอ
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      category: { in: categories },
      province: shop.province,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
}

/** บทความ published ในหมวดที่ map กับหมวดประกาศที่กำหนด (หน้าร้าน + หน้าหมวด directory) */
export async function getArticlesForListingCategories(
  listingCategories: string[],
  limit = 3,
) {
  const articleCategories = ARTICLE_CATEGORIES.filter(
    (a) =>
      a.relatedListingCategory &&
      listingCategories.includes(a.relatedListingCategory),
  ).map((a) => a.value);
  if (articleCategories.length === 0) return [];
  return prisma.article.findMany({
    where: { published: true, category: { in: articleCategories } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverUrl: true,
      category: true,
      publishedAt: true,
    },
  });
}

/** ร้านทั้งหมดสำหรับ sitemap (D4) */
export async function getAllApprovedShops() {
  return prisma.shop.findMany({
    where: APPROVED_WHERE,
    select: {
      slug: true,
      province: true,
      categories: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}
