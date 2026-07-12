// Feature flags — เปิด/ปิดฟีเจอร์ที่ยังไม่พร้อมโดยไม่ต้องลบโค้ด (CLAUDE.md §4)

export const FLAGS = {
  /** ล็อกอินด้วยเบอร์โทร OTP — ปิดไว้ก่อน ค่า SMS มีต้นทุน (เปิด Phase 2) */
  PHONE_OTP: false,
  /** Directory ร้านค้า/ตัวแทนจำหน่าย (Phase 1.5) */
  SHOP_DIRECTORY: false,
  /** บันทึกประกาศ/Favorites (Phase 2) */
  FAVORITES: false,

  // ── Phase 2 (PLAN-PHASE2.md §1.4) — สร้างเสร็จค่อยเปิดทีละตัว ──
  /** รีวิว/ให้คะแนนผู้ขาย (กลุ่ม T) — สร้างเสร็จ+เทสผ่าน (T2); เปิดเป็น true เมื่อพร้อมใช้ */
  REVIEWS: false,
  /** ราคากลางสินค้าเกษตรรายวัน (กลุ่ม P) */
  PRICES: false,
  /** โปรไฟล์เกษตรกร (ฟาร์ม/ไร่/ร้าน) (กลุ่ม U) */
  FARM_PROFILE: false,
  /** กระดานจับคู่ซื้อขาย Demand & Supply (กลุ่ม B) */
  MATCHING: false,
  /** ชุมชนพูดคุยปัญหาเกษตร (กลุ่ม C) */
  COMMUNITY: false,
  /** เช็คค่าขนส่งทุกค่าย (กลุ่ม S) */
  SHIPPING_RATES: false,
} as const;

export type FlagKey = keyof typeof FLAGS;
