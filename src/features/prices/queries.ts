// Queries ราคากลาง — admin (P1) + public (P2)

import { prisma } from "@/lib/prisma";
import { listingCategoriesForPriceCategory } from "@/config/priceCategories";

/** วันปฏิทินไทย (Asia/Bangkok = UTC+7) เป็น "YYYY-MM-DD" */
export function bangkokTodayStr(): string {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" → Date (UTC midnight) สำหรับคอลัมน์ @db.Date */
export function dateFromStr(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

/**
 * รายการ active + entry ล่าสุดที่ ≤ วันที่เลือก (prefill หน้ากรอกรายวัน)
 * ถ้าวันที่เลือกมี entry แล้ว → คืน entry ของวันนั้น (แก้ค่าที่บันทึกไว้)
 * ถ้ายัง → คืน entry ล่าสุดก่อนหน้า (prefill ค่าเมื่อวานให้ยืนยัน/แก้)
 */
export async function getItemsForDailyEntry(dateStr: string) {
  const date = dateFromStr(dateStr);
  return prisma.priceItem.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      entries: {
        where: { date: { lte: date } },
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });
}

export type DailyEntryItem = Awaited<
  ReturnType<typeof getItemsForDailyEntry>
>[number];

/** ทุกรายการ (active + inactive) สำหรับหน้าจัดการ */
export async function getAllPriceItems() {
  return prisma.priceItem.findMany({
    orderBy: [{ active: "desc" }, { order: "asc" }, { name: "asc" }],
  });
}

export async function getPriceItemById(id: string) {
  return prisma.priceItem.findUnique({ where: { id } });
}

// ---------- public (P2) ----------

/** หน้ารวมราคา: item active ที่มี entry — พร้อม entry ล่าสุด 2 อัน (คำนวณลูกศรเปลี่ยนแปลง) */
export async function getPriceOverview() {
  const items = await prisma.priceItem.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { entries: { orderBy: { date: "desc" }, take: 2 } },
  });
  const withData = items.filter((it) => it.entries.length > 0);
  const lastUpdated = withData.reduce<Date | null>((max, it) => {
    const d = it.entries[0].date;
    return !max || d > max ? d : max;
  }, null);
  return { items: withData, lastUpdated };
}

export type PriceOverviewItem = Awaited<
  ReturnType<typeof getPriceOverview>
>["items"][number];

/** หน้ารายตัว: item active + 30 วันล่าสุด (ไม่มี entry = null → 404) */
export async function getPriceItemDetail(slug: string) {
  const item = await prisma.priceItem.findFirst({
    where: { slug, active: true },
    include: { entries: { orderBy: { date: "desc" }, take: 30 } },
  });
  if (!item || item.entries.length === 0) return null;
  return item;
}

/** slug ของ item ที่ควรเข้า sitemap (active + มี entry) */
export async function getPriceItemsForSitemap() {
  const items = await prisma.priceItem.findMany({
    where: { active: true, entries: { some: {} } },
    select: {
      slug: true,
      entries: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
    },
  });
  return items.map((i) => ({ slug: i.slug, lastModified: i.entries[0]?.date }));
}

// รายการเด่นบนหน้าแรก (แถบ "ราคาวันนี้")
const HOME_PRICE_SLUGS = [
  "ไข่ไก่คละหน้าฟาร์ม",
  "สุกรมีชีวิตหน้าฟาร์ม",
  "ข้าวเปลือกหอมมะลิ",
  "ทุเรียนหมอนทอง",
  "มันสำปะหลัง",
];

export async function getHomeFeaturedPrices() {
  const items = await prisma.priceItem.findMany({
    where: { active: true, slug: { in: HOME_PRICE_SLUGS }, entries: { some: {} } },
    include: { entries: { orderBy: { date: "desc" }, take: 2 } },
  });
  // คงลำดับตาม HOME_PRICE_SLUGS
  return HOME_PRICE_SLUGS.map((s) => items.find((i) => i.slug === s)).filter(
    (i): i is (typeof items)[number] => Boolean(i),
  );
}

/** ประกาศขาย ACTIVE ในหมวดที่ map กับหมวดราคา (cross-link หน้ารายตัว) */
export async function getListingsForPriceCategory(
  priceCategory: string,
  limit = 4,
) {
  const cats = listingCategoriesForPriceCategory(priceCategory);
  if (cats.length === 0) return [];
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      category: { in: cats },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
}

/** slug ทั้งหมดที่มี entry (revalidate ตอนแอดมินบันทึกราคา) */
export async function getPriceItemSlugsByIds(ids: string[]) {
  const items = await prisma.priceItem.findMany({
    where: { id: { in: ids } },
    select: { slug: true },
  });
  return items.map((i) => i.slug);
}
