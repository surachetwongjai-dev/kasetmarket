// หมวดราคากลางสินค้าเกษตร (P) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// `value` ascii เก็บใน DB (convention เดียวกับ categories.ts), `label` แสดงผล

export type PriceCategory = {
  value: string;
  label: string;
  icon: string;
};

export const PRICE_CATEGORIES: PriceCategory[] = [
  { value: "field-crops", label: "ข้าว-พืชไร่", icon: "🌾" },
  { value: "vegetables", label: "ผัก", icon: "🥬" },
  { value: "fruits", label: "ผลไม้", icon: "🍍" },
  { value: "livestock", label: "ปศุสัตว์", icon: "🐖" },
  { value: "fishery", label: "ประมง", icon: "🐟" },
  { value: "others", label: "อื่นๆ", icon: "📦" },
];

export const PRICE_CATEGORY_VALUES = PRICE_CATEGORIES.map((c) => c.value);

export function getPriceCategory(value: string): PriceCategory | undefined {
  return PRICE_CATEGORIES.find((c) => c.value === value);
}

export function getPriceCategoryLabel(value: string): string {
  return getPriceCategory(value)?.label ?? value;
}
