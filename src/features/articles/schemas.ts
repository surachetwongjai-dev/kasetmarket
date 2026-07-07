import { z } from "zod";
import { ARTICLE_CATEGORY_VALUES } from "@/config/articleCategories";

const categoryValues = ARTICLE_CATEGORY_VALUES as [string, ...string[]];

export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "หัวข้อสั้นเกินไป (อย่างน้อย 10 ตัวอักษร)")
    .max(150, "หัวข้อยาวเกิน 150 ตัวอักษร"),
  excerpt: z
    .string()
    .trim()
    .min(20, "กรุณาเขียนคำโปรย (สรุปสั้นๆ) อย่างน้อย 20 ตัวอักษร")
    .max(300, "คำโปรยยาวเกิน 300 ตัวอักษร"),
  content: z
    .string()
    .trim()
    .min(50, "เนื้อหาสั้นเกินไป (อย่างน้อย 50 ตัวอักษร)"),
  category: z.enum(categoryValues, { message: "กรุณาเลือกหมวดหมู่" }),
  coverUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  published: z.boolean(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

export function articleFormDataToObject(formData: FormData) {
  return {
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    coverUrl: formData.get("coverUrl") ?? "",
    published: formData.get("published") === "on",
  };
}
