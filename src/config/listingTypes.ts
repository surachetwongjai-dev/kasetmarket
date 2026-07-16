// ประเภทประกาศ ขาย/ต้องการซื้อ — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว (CLAUDE.md §4)
// value ตรงกับ enum ListingType ใน Prisma (SELL | BUY)

export type ListingTypeValue = "SELL" | "BUY";

export type ListingTypeMeta = {
  value: ListingTypeValue;
  label: string; // ป้ายสั้นบนการ์ด/badge เช่น "ขาย" / "ต้องการซื้อ"
  formLabel: string; // ตัวเลือกในฟอร์ม (ภาษาคน)
  formHint: string; // คำอธิบายใต้ตัวเลือกในฟอร์ม
  priceLabel: string; // label ช่องราคาในฟอร์มตามประเภท
  titlePlaceholder: string; // ตัวอย่างชื่อประกาศในฟอร์ม
  verb: string; // ใช้ประกอบ headline/title เช่น "ประกาศขาย" / "ประกาศรับซื้อ"
  icon: string;
  /** สี badge — SELL เขียวใบข้าว, BUY ทองข้าวเปลือก (โทนแบรนด์ §3) */
  badgeClass: string;
};

export const LISTING_TYPES: ListingTypeMeta[] = [
  {
    value: "SELL",
    label: "ขาย",
    formLabel: "ขายสินค้า",
    formHint: "ฉันมีสินค้าเกษตรจะขาย",
    priceLabel: "ราคา (บาท)",
    titlePlaceholder: "เช่น ขายข้าวหอมมะลิ 105 เกี่ยวใหม่",
    verb: "ประกาศขาย",
    icon: "🏷️",
    badgeClass: "bg-primary text-primary-foreground",
  },
  {
    value: "BUY",
    label: "ต้องการซื้อ",
    formLabel: "ต้องการซื้อ",
    formHint: "ฉันกำลังหา/รับซื้อสินค้าเกษตร",
    priceLabel: "ราคาที่รับซื้อ (บาท)",
    titlePlaceholder: "เช่น รับซื้อข้าวเปลือกหอมมะลิ จำนวนมาก",
    verb: "ประกาศรับซื้อ",
    icon: "🛒",
    badgeClass: "bg-accent-gold text-accent-gold-foreground",
  },
];

const DEFAULT = LISTING_TYPES[0];

export function listingTypeMeta(value: string): ListingTypeMeta {
  return LISTING_TYPES.find((t) => t.value === value) ?? DEFAULT;
}

/** true ถ้าค่าเป็นประเภทที่รู้จัก — ใช้กรอง query param */
export function isListingType(value: unknown): value is ListingTypeValue {
  return value === "SELL" || value === "BUY";
}
