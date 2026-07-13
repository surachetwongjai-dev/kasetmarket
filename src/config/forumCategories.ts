// หมวดชุมชนพูดคุย (C1) — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// value ascii เก็บใน DB (convention เดียวกับ categories), label ไทยแสดงผล

export type ForumCategory = {
  value: string;
  label: string;
  icon: string;
};

export const FORUM_CATEGORIES: ForumCategory[] = [
  { value: "rice", label: "ข้าว", icon: "🌾" },
  { value: "field-crops", label: "พืชไร่", icon: "🌽" },
  { value: "veg-fruit", label: "ผัก-ผลไม้", icon: "🥬" },
  { value: "livestock-fishery", label: "ปศุสัตว์-ประมง", icon: "🐄" },
  { value: "fertilizer-disease", label: "ปุ๋ย-ยา-โรคพืช", icon: "🧪" },
  { value: "machinery-tech", label: "เครื่องจักร-เทคโนโลยี", icon: "🚜" },
  { value: "price-market", label: "ราคา-การตลาด", icon: "📊" },
  { value: "general", label: "คุยทั่วไป", icon: "💬" },
];

export function getForumCategory(value: string): ForumCategory | undefined {
  return FORUM_CATEGORIES.find((c) => c.value === value);
}

export function getForumCategoryLabel(value: string): string {
  return getForumCategory(value)?.label ?? value;
}
