// หมวดราคากลางสินค้าเกษตร (P) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// `value` ascii เก็บใน DB (convention เดียวกับ categories.ts), `label` แสดงผล

export type PriceCategory = {
  value: string;
  label: string;
  icon: string;
  /** map ไปหมวดประกาศ (config/categories.ts) สำหรับ cross-link หน้าราคา → ประกาศ (P2) */
  listingCategories: string[];
};

export const PRICE_CATEGORIES: PriceCategory[] = [
  { value: "field-crops", label: "ข้าว-พืชไร่", icon: "🌾", listingCategories: ["rice", "field-crops"] },
  { value: "vegetables", label: "ผัก", icon: "🥬", listingCategories: ["vegetables"] },
  { value: "fruits", label: "ผลไม้", icon: "🍍", listingCategories: ["fruits"] },
  { value: "livestock", label: "ปศุสัตว์", icon: "🐖", listingCategories: ["livestock"] },
  { value: "fishery", label: "ประมง", icon: "🐟", listingCategories: ["livestock"] },
  { value: "others", label: "อื่นๆ", icon: "📦", listingCategories: [] },
];

export const PRICE_CATEGORY_VALUES = PRICE_CATEGORIES.map((c) => c.value);

export function getPriceCategory(value: string): PriceCategory | undefined {
  return PRICE_CATEGORIES.find((c) => c.value === value);
}

export function getPriceCategoryLabel(value: string): string {
  return getPriceCategory(value)?.label ?? value;
}

/** หมวดประกาศที่ map กับหมวดราคา (cross-link P2) */
export function listingCategoriesForPriceCategory(value: string): string[] {
  return getPriceCategory(value)?.listingCategories ?? [];
}
