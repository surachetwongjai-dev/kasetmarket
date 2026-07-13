import { z } from "zod";
import { FORUM_CATEGORIES } from "@/config/forumCategories";

// ชุมชน (C1) — validate ฝั่ง server เสมอ
const categoryValues = FORUM_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

export const MAX_THREAD_IMAGES = 3;
export const MAX_THREAD_TITLE = 120;
export const MAX_THREAD_BODY = 5000;
export const MAX_REPLY_BODY = 5000;
export const THREAD_DAILY_LIMIT = 5;
export const REPLY_DAILY_LIMIT = 30;

export const threadImageSchema = z.object({
  key: z.string().min(1),
  url: z.string().min(1),
});

export const threadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "หัวข้อสั้นเกินไป (อย่างน้อย 5 ตัวอักษร)")
    .max(MAX_THREAD_TITLE, `หัวข้อยาวเกิน ${MAX_THREAD_TITLE} ตัวอักษร`),
  body: z
    .string()
    .trim()
    .min(10, "กรุณาเขียนเนื้อหาอย่างน้อย 10 ตัวอักษร")
    .max(MAX_THREAD_BODY, `เนื้อหายาวเกิน ${MAX_THREAD_BODY} ตัวอักษร`),
  category: z.enum(categoryValues, { message: "กรุณาเลือกหมวด" }),
  images: z
    .array(threadImageSchema)
    .max(MAX_THREAD_IMAGES, `ใส่รูปได้สูงสุด ${MAX_THREAD_IMAGES} รูป`),
});

export const replySchema = z.object({
  threadId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "กรุณาพิมพ์คำตอบ")
    .max(MAX_REPLY_BODY, `คำตอบยาวเกิน ${MAX_REPLY_BODY} ตัวอักษร`),
});

/** แปลง FormData ฟอร์มตั้งกระทู้ → object สำหรับ zod */
export function threadFormDataToObject(formData: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = [];
  }
  return {
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
    images,
  };
}

// C2: รายงาน + แก้ไข
export const FORUM_REPORT_REASONS = [
  "เนื้อหาไม่เหมาะสม",
  "สแปม/โฆษณา",
  "ข้อมูลเท็จ/หลอกลวง",
  "ผิดกฎหมาย",
  "อื่นๆ",
] as const;

export const forumReportSchema = z.object({
  target: z.enum(["thread", "reply"]),
  targetId: z.string().min(1),
  reason: z.enum(FORUM_REPORT_REASONS, { message: "กรุณาเลือกเหตุผล" }),
});

export const replyEditSchema = z.object({
  replyId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "กรุณาพิมพ์คำตอบ")
    .max(MAX_REPLY_BODY, `คำตอบยาวเกิน ${MAX_REPLY_BODY} ตัวอักษร`),
});

/** แก้ไขได้ภายในกี่ชั่วโมงหลังโพส (กันย้อนแก้ประวัติ) */
export const EDIT_WINDOW_HOURS = 24;
