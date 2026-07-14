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
  /** ราคากลางสินค้าเกษตรรายวัน (กลุ่ม P) — หน้า public สร้างเสร็จ+เทสผ่าน (P2); เปิด true เมื่อกรอกข้อมูลพร้อม */
  PRICES: false,
  /** โปรไฟล์เกษตรกร (ฟาร์ม/ไร่/ร้าน) (กลุ่ม U) — U1+U2 เสร็จ+เทสผ่าน; เปิด true ตอน deploy หลังรัน migration add_farm_profile บน prod */
  FARM_PROFILE: false,
  /** กระดานจับคู่ซื้อขาย Demand & Supply (กลุ่ม B) — B1+B2 เสร็จ+เทสผ่านครบ; เปิด true ได้เลยตอน deploy หลังรัน migration add_match_post บน prod */
  MATCHING: false,
  /** ชุมชนพูดคุยปัญหาเกษตร (กลุ่ม C) — C1+C2+C3 เสร็จ+เทสผ่านครบ; prod migrate ครบแล้ว (add_community, add_forum_report) + seed กระทู้ตั้งต้น 12 (scripts/seed-community.ts) → เปิด true (2026-07-14) */
  COMMUNITY: true,
  /** เช็คค่าขนส่งทุกค่าย (กลุ่ม S) — S1 เสร็จ+เทสผ่าน; หน้า utility ล้วน ไม่มี migration เปิด true ได้เลยตอน deploy (ทบทวนเรทใน config เดือนละครั้ง) */
  SHIPPING_RATES: false,
} as const;

export type FlagKey = keyof typeof FLAGS;
