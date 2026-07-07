// Feature flags — เปิด/ปิดฟีเจอร์ที่ยังไม่พร้อมโดยไม่ต้องลบโค้ด (CLAUDE.md §4)

export const FLAGS = {
  /** ล็อกอินด้วยเบอร์โทร OTP — ปิดไว้ก่อน ค่า SMS มีต้นทุน (เปิด Phase 2) */
  PHONE_OTP: false,
  /** Directory ร้านค้า/ตัวแทนจำหน่าย (Phase 1.5) */
  SHOP_DIRECTORY: false,
  /** บันทึกประกาศ/Favorites (Phase 2) */
  FAVORITES: false,
  /** ราคาตลาดกลางรายวัน (Phase 2) */
  MARKET_PRICES: false,
  /** ฟอรัมถามตอบ (Phase 2) */
  FORUM: false,
} as const;

export type FlagKey = keyof typeof FLAGS;
