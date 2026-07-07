// หมวดหมู่บทความ — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว (CLAUDE.md §4)
// เก็บ label ภาษาไทยตรงๆ ใน DB (Article.category) — ตรงกับที่ seed M2 ใช้
// relatedListingCategory: ผูกไปหมวดประกาศเพื่อทำ CTA "ดูประกาศหมวดนี้" ท้ายบทความ (§8 ชั้นคอนเทนต์ → รายได้)

import type { Category } from "./categories";

export type ArticleCategory = {
  value: string; // = label (เก็บใน DB)
  /** หมวดประกาศที่เกี่ยวข้อง (value จาก config/categories.ts) สำหรับ CTA — null = ไม่มี */
  relatedListingCategory: string | null;
};

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { value: "ปุ๋ย", relatedListingCategory: "fertilizer" },
  { value: "โรคพืช", relatedListingCategory: "fertilizer" },
  { value: "ราคาตลาด", relatedListingCategory: null },
  { value: "เทคนิค", relatedListingCategory: null },
  { value: "ข่าวเกษตร", relatedListingCategory: null },
];

export const ARTICLE_CATEGORY_VALUES = ARTICLE_CATEGORIES.map((c) => c.value);

export function isArticleCategory(value: string): boolean {
  return ARTICLE_CATEGORY_VALUES.includes(value);
}

export function relatedListingCategoryOf(articleCategory: string): string | null {
  return (
    ARTICLE_CATEGORIES.find((c) => c.value === articleCategory)
      ?.relatedListingCategory ?? null
  );
}
