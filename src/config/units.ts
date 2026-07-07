// หน่วยขายสินค้าเกษตร — แสดงเป็น "บาท/{หน่วย}" บนป้ายราคา (signature element)

export type Unit = {
  value: string;
  label: string; // หน่วยภาษาไทย เช่น "กก." → แสดง "บาท/กก."
};

export const UNITS: Unit[] = [
  { value: "kg", label: "กก." },
  { value: "ton", label: "ตัน" },
  { value: "bag", label: "ถุง" },
  { value: "sack", label: "กระสอบ" },
  { value: "tree", label: "ต้น" },
  { value: "rai", label: "ไร่" },
  { value: "animal", label: "ตัว" },
  { value: "piece", label: "ชิ้น" },
  { value: "machine", label: "เครื่อง" },
  { value: "lump-sum", label: "เหมา" },
];

export function getUnitLabel(value: string): string {
  return UNITS.find((u) => u.value === value)?.label ?? value;
}
