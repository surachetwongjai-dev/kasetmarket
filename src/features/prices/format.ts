// Helpers แสดงผลราคา (ไม่พึ่ง prisma — ใช้ได้ใน component)

export type EntryLike = {
  priceMin: unknown; // Prisma.Decimal
  priceMax: unknown | null;
};

/** ค่ากลางของ entry (ใช้เทียบการเปลี่ยนแปลง) */
export function priceMid(e: EntryLike): number {
  const min = Number(e.priceMin);
  const max = e.priceMax == null ? min : Number(e.priceMax);
  return (min + max) / 2;
}

const fmt = (n: number) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: 2 });

/** "12–14" หรือ "12" (ราคาเดียว) */
export function formatRange(e: EntryLike): string {
  const min = Number(e.priceMin);
  const max = e.priceMax == null ? null : Number(e.priceMax);
  return max == null || max === min ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

export type ChangeDir = "up" | "down" | "same";

/** ทิศทาง+ส่วนต่างเทียบ entry ก่อนหน้า (null = ไม่มีค่าก่อนหน้าให้เทียบ) */
export function priceChange(
  latest: EntryLike,
  prev?: EntryLike | null,
): { dir: ChangeDir; diff: number } | null {
  if (!prev) return null;
  const diff = priceMid(latest) - priceMid(prev);
  const dir: ChangeDir = diff > 0.001 ? "up" : diff < -0.001 ? "down" : "same";
  return { dir, diff };
}

export function formatDiff(diff: number): string {
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  return `${sign}${fmt(Math.abs(diff))}`;
}

/** ราคาถือว่าเก่า (ไม่ได้อัปเดต) ถ้าเกิน 7 วัน (PLAN-PHASE2 §8) */
export function isStale(date: Date, days = 7): boolean {
  return Date.now() - date.getTime() > days * 24 * 3600 * 1000;
}
