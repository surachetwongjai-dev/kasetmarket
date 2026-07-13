// ประเภทกิจการเกษตร (โปรไฟล์เกษตรกร U1) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// `value` เป็น ascii เก็บใน DB (convention เดียวกับ categories/shopCategories), `label` แสดงผล

export type FarmType = {
  value: string;
  label: string;
  icon: string; // emoji สำหรับ chips หน้าโปรไฟล์
};

export const FARM_TYPES: FarmType[] = [
  { value: "rice-paddy", label: "นาข้าว", icon: "🌾" },
  { value: "orchard", label: "สวนผลไม้", icon: "🍊" },
  { value: "field-crop", label: "ไร่พืชไร่", icon: "🌽" },
  { value: "livestock", label: "ฟาร์มปศุสัตว์", icon: "🐄" },
  { value: "aquaculture", label: "บ่อปลา-กุ้ง", icon: "🐟" },
  { value: "agri-shop", label: "ร้านค้าเกษตร", icon: "🏪" },
  { value: "buyer", label: "โรงงาน-ผู้รับซื้อ", icon: "🏭" },
  { value: "others", label: "อื่นๆ", icon: "🌱" },
];

export function getFarmTypeLabel(value: string): string {
  return FARM_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function getFarmType(value: string): FarmType | undefined {
  return FARM_TYPES.find((t) => t.value === value);
}
