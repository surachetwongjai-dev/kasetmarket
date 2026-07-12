import { z } from "zod";

// รีวิวผู้ขาย (T2) — rating บังคับ, comment ไม่บังคับ ≤1,000 ตัวอักษร
export const MAX_REVIEW_COMMENT = 1000;
export const MAX_SELLER_REPLY = 1000;
export const REVIEW_DAILY_LIMIT = 5; // เขียน/แก้รีวิวรวม 5 ครั้ง/วัน/user
export const REVIEW_ELIGIBLE_HOURS = 24; // ต้องกดดูช่องทางติดต่อมาแล้ว ≥24 ชม.

export const reviewSchema = z.object({
  sellerId: z.string().min(1),
  listingId: z.string().min(1).optional(),
  rating: z.coerce.number().int().min(1, "ให้คะแนน 1-5 ดาว").max(5, "ให้คะแนน 1-5 ดาว"),
  comment: z
    .string()
    .trim()
    .max(MAX_REVIEW_COMMENT, "ความเห็นยาวเกินไป")
    .optional(),
});

export const sellerReplySchema = z.object({
  reviewId: z.string().min(1),
  reply: z
    .string()
    .trim()
    .min(1, "กรุณาพิมพ์คำตอบ")
    .max(MAX_SELLER_REPLY, "คำตอบยาวเกินไป"),
});

// เหตุผลรายงานรีวิว
export const REVIEW_REPORT_REASONS = [
  "ข้อความไม่เหมาะสม",
  "ข้อมูลเท็จ/ใส่ร้าย",
  "สแปม/โฆษณา",
  "ไม่เกี่ยวกับการซื้อขาย",
  "อื่นๆ",
] as const;

export const reviewReportSchema = z.object({
  reviewId: z.string().min(1),
  reason: z.enum(REVIEW_REPORT_REASONS, { message: "กรุณาเลือกเหตุผล" }),
});

// ยืนยันตัวตน (T3) — ไม่มีช่องอัปโหลดไฟล์ (PDPA) มีแค่ note ข้อความ
export const MAX_VERIFY_NOTE = 1000;

export const verificationRequestSchema = z.object({
  note: z
    .string()
    .trim()
    .max(MAX_VERIFY_NOTE, "ข้อความยาวเกินไป")
    .optional(),
});

export const verifyApproveSchema = z.object({
  id: z.string().min(1),
  method: z
    .string()
    .trim()
    .min(3, "กรุณาบันทึกวิธีที่ใช้ตรวจ (อย่างน้อย 3 ตัวอักษร)")
    .max(300),
});

export const verifyRejectSchema = z.object({
  id: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(5, "กรุณาบอกเหตุผลให้ผู้ขอเข้าใจ (อย่างน้อย 5 ตัวอักษร)")
    .max(500),
});
