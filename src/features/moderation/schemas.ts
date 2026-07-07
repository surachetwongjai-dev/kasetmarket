import { z } from "zod";

// เหตุผลการรายงานประกาศ (CLAUDE.md §5 Report.reason)
export const REPORT_REASONS = [
  "หลอกลวง",
  "สินค้าผิดกฎหมาย",
  "สแปม",
  "อื่นๆ",
] as const;

export const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(REPORT_REASONS, { message: "กรุณาเลือกเหตุผล" }),
  detail: z.string().trim().max(1000, "รายละเอียดยาวเกินไป").optional(),
});

// เหตุผล reject ประกาศ (M7) — แสดงให้ผู้ขายเห็น
export const rejectSchema = z.object({
  listingId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(5, "กรุณาบอกเหตุผลให้ผู้ขายเข้าใจ (อย่างน้อย 5 ตัวอักษร)")
    .max(500),
});
