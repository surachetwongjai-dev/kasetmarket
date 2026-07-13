// ตัวช่วย path หน้าเช็คค่าส่ง (S1) — URL สาธารณะเป็นไทย /เช็คค่าส่ง
// route จริงเป็น ascii /shipping-rates (rewrite ใน next.config — แพทเทิร์นเดียวกับกลุ่มอื่น)

import { SITE_URL } from "@/config/site";

export const SHIPPING_BASE = "/เช็คค่าส่ง";

export function shippingAbsoluteUrl(path: string = SHIPPING_BASE): string {
  // path มีอักขระไทย → encode ให้ปลอดภัยใน sitemap/canonical
  return `${SITE_URL}${path.split("/").map(encodeURIComponent).join("/")}`;
}
