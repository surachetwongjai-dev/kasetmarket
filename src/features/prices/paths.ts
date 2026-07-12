// path helpers ราคากลาง — URL สาธารณะเป็นไทย /ราคาสินค้าเกษตร (rewrite → /prices ใน next.config)
// ห้ามประกอบ path เอง (กัน pattern เพี้ยน — เหมือน directory §10)

import { SITE_URL } from "@/config/site";

export const PRICES_BASE = "/ราคาสินค้าเกษตร";

export function pricePath(slug: string): string {
  return `${PRICES_BASE}/${slug}`;
}

/** URL เต็มจาก path ภายใน — encode segment ไทยให้ตรงที่ crawler ใช้จริง */
export function priceAbsoluteUrl(path: string): string {
  return SITE_URL + path.split("/").map(encodeURIComponent).join("/");
}
