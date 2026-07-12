// Queries ราคากลาง (P1) — ฝั่ง admin เห็นทุกรายการ (public P2 ค่อยเพิ่ม)

import { prisma } from "@/lib/prisma";

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
