// ตัวช่วยสร้าง path ของ directory ร้านค้า — slug ภาษาไทยตาม CLAUDE.md §10
// รวมไว้ที่เดียวกันทุกหน้า ห้ามประกอบ path เอง (กัน pattern เพี้ยน)

import { getShopCategory } from "@/config/shopCategories";

export const DIRECTORY_BASE = "/ร้านค้า";

export function provincePath(province: string): string {
  return `${DIRECTORY_BASE}/${province}`;
}

export function categoryPath(province: string, categorySlug: string): string {
  return `${provincePath(province)}/${categorySlug}`;
}

/** path หน้าโปรไฟล์ร้าน — ใช้หมวดแรกของร้านเป็นหมวดหลักใน URL (canonical) */
export function shopPath(shop: {
  slug: string;
  province: string;
  categories: string[];
}): string {
  const primary = getShopCategory(shop.categories[0]);
  // ร้านที่ไม่มีหมวด (ไม่ควรเกิด — seed/ฟอร์ม validate แล้ว) fallback ไปหน้าจังหวัด
  if (!primary) return provincePath(shop.province);
  return `${categoryPath(shop.province, primary.slug)}/${shop.slug}`;
}
