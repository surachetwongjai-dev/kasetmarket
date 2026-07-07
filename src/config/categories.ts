// หมวดหมู่สินค้าเกษตร — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว ห้าม hardcode ในหน้า
// `value` เป็น ascii ใช้เก็บใน DB / query param, `label` แสดงผล

export type Category = {
  value: string;
  label: string;
};

export const CATEGORIES: Category[] = [
  { value: "rice", label: "ข้าว/ข้าวเปลือก" },
  { value: "vegetables", label: "ผัก" },
  { value: "fruits", label: "ผลไม้" },
  { value: "field-crops", label: "พืชไร่ (มัน/อ้อย/ข้าวโพด)" },
  { value: "seedlings", label: "ต้นกล้า-เมล็ดพันธุ์" },
  { value: "fertilizer", label: "ปุ๋ย-ฮอร์โมน" },
  { value: "livestock", label: "สัตว์เลี้ยงเกษตร (วัว/หมู/ไก่/ปลา)" },
  { value: "machinery", label: "เครื่องจักร-อุปกรณ์" },
  { value: "land", label: "ที่ดิน-สวน-นา" },
  { value: "others", label: "อื่นๆ" },
];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
