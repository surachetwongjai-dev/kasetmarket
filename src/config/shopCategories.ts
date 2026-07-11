// หมวดร้านค้า directory (Phase 1.5) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว ห้าม hardcode ในหน้า
// `value` เป็น ascii เก็บใน DB (Shop.categories), `slug` เป็นไทยใช้ใน URL /ร้านค้า/[จังหวัด]/[หมวด]
// `listingCategories` = mapping หมวดร้าน ↔ หมวดประกาศ (CLAUDE.md §10) ใช้ทำ cross-link สองทาง

export type ShopCategory = {
  value: string;
  label: string;
  slug: string; // URL segment ภาษาไทย (ห้ามมี "/" หรือช่องว่าง)
  icon: string; // emoji สำหรับ chip/การ์ด
  /** หมวดประกาศที่เกี่ยวข้อง (value จาก config/categories.ts) */
  listingCategories: string[];
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    value: "fertilizer-chem",
    label: "ปุ๋ย-เคมีเกษตร",
    slug: "ปุ๋ย-เคมีเกษตร",
    icon: "🧪",
    listingCategories: ["fertilizer"],
  },
  {
    value: "seeds",
    label: "เมล็ดพันธุ์",
    slug: "เมล็ดพันธุ์",
    icon: "🌱",
    listingCategories: ["seedlings"],
  },
  {
    value: "machinery",
    label: "เครื่องจักรกลเกษตร",
    slug: "เครื่องจักรกลเกษตร",
    icon: "🚜",
    listingCategories: ["machinery"],
  },
  {
    value: "parts-repair",
    label: "อะไหล่-ซ่อมบำรุง",
    slug: "อะไหล่-ซ่อมบำรุง",
    icon: "🔧",
    listingCategories: ["machinery"],
  },
  {
    value: "general-supplies",
    label: "ร้านวัสดุเกษตรทั่วไป",
    slug: "วัสดุเกษตร",
    icon: "🏪",
    listingCategories: ["fertilizer", "seedlings", "others"],
  },
  {
    value: "produce-buyer",
    label: "รับซื้อผลผลิต",
    slug: "รับซื้อผลผลิต",
    icon: "⚖️",
    listingCategories: ["rice", "vegetables", "fruits", "field-crops"],
  },
];

export const SHOP_CATEGORY_VALUES = SHOP_CATEGORIES.map((c) => c.value);

export function getShopCategory(value: string): ShopCategory | undefined {
  return SHOP_CATEGORIES.find((c) => c.value === value);
}

export function getShopCategoryLabel(value: string): string {
  return getShopCategory(value)?.label ?? value;
}

export function shopCategoryBySlug(slug: string): ShopCategory | undefined {
  return SHOP_CATEGORIES.find((c) => c.slug === slug);
}

/** หมวดประกาศทั้งหมดที่เกี่ยวข้องกับร้าน (union จากทุกหมวดของร้าน ไม่ซ้ำ) */
export function listingCategoriesOfShop(shopCategoryValues: string[]): string[] {
  return [
    ...new Set(
      shopCategoryValues.flatMap(
        (v) => getShopCategory(v)?.listingCategories ?? [],
      ),
    ),
  ];
}

/** หมวดร้านที่เกี่ยวข้องกับหมวดประกาศหนึ่งๆ (reverse mapping สำหรับบล็อก "ร้านค้าใกล้คุณ" บนหน้าประกาศ) */
export function shopCategoriesForListingCategory(
  listingCategory: string,
): string[] {
  return SHOP_CATEGORIES.filter((c) =>
    c.listingCategories.includes(listingCategory),
  ).map((c) => c.value);
}
