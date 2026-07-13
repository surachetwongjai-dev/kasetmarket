// ประเภทโพสกระดานจับคู่ซื้อขาย (B1) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// value ตรงกับ enum MatchPostType ใน Prisma (SUPPLY | DEMAND)

export type MatchTypeValue = "SUPPLY" | "DEMAND";

export type MatchTypeMeta = {
  value: MatchTypeValue;
  label: string; // ป้ายสั้นบนการ์ด/badge
  formLabel: string; // ตัวเลือกในฟอร์ม (ภาษาคน)
  boardLabel: string; // ชื่อแท็บบนกระดาน
  dateLabel: string; // ความหมายของ targetDate ตาม type
  icon: string;
};

export const MATCH_TYPES: MatchTypeMeta[] = [
  {
    value: "SUPPLY",
    label: "เสนอขายผลผลิต",
    formLabel: "ผมมีผลผลิตจะขาย (ล่วงหน้าได้)",
    boardLabel: "ผลผลิตเสนอขาย",
    dateLabel: "พร้อมส่ง/พร้อมตัด",
    icon: "🌾",
  },
  {
    value: "DEMAND",
    label: "ประกาศรับซื้อ",
    formLabel: "ผมต้องการรับซื้อ",
    boardLabel: "ประกาศรับซื้อ",
    dateLabel: "ต้องการภายใน",
    icon: "🏭",
  },
];

export function matchTypeMeta(value: string): MatchTypeMeta {
  return MATCH_TYPES.find((t) => t.value === value) ?? MATCH_TYPES[0];
}
