// ตัวช่วยสร้าง path กระดานจับคู่ซื้อขาย (B2) — URL สาธารณะเป็นไทย /จับคู่ซื้อขาย
// route จริงเป็น ascii /matching (rewrite ใน next.config — แพทเทิร์นเดียวกับ directory/prices)
// ห้ามประกอบ path เอง (กัน pattern เพี้ยน)

import { SITE_URL } from "@/config/site";

export const MATCHING_BASE = "/จับคู่ซื้อขาย";

export function matchPostPath(slug: string): string {
  return `${MATCHING_BASE}/${slug}`;
}

export type MatchBoardParams = {
  type?: string;
  category?: string;
  province?: string;
  sort?: string;
  page?: string;
};

/** URL กระดานพร้อม filter (tab/pagination/cross-link) — เก็บเฉพาะค่าที่มี */
export function matchBoardPath(params: MatchBoardParams): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `${MATCHING_BASE}?${qs}` : MATCHING_BASE;
}

export function matchAbsoluteUrl(path: string): string {
  // path มีอักขระไทย → encode ให้ปลอดภัยใน sitemap/canonical
  return `${SITE_URL}${path.split("/").map(encodeURIComponent).join("/")}`;
}
