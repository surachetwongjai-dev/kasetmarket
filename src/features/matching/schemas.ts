import { z } from "zod";
import { CATEGORIES } from "@/config/categories";
import { PROVINCES } from "@/config/provinces";

// กระดานจับคู่ซื้อขาย (B1) — reuse หมวด/จังหวัดจากประกาศ · validate ฝั่ง server เสมอ
const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const provinceNames = PROVINCES.map((p) => p.name) as [string, ...string[]];

export const MATCH_DAILY_LIMIT = 3; // 3 โพส/วัน/user (สเปค B1)

export const matchPostSchema = z
  .object({
    type: z.enum(["SUPPLY", "DEMAND"], { message: "กรุณาเลือกประเภทโพส" }),
    title: z
      .string()
      .trim()
      .min(5, "หัวข้อสั้นเกินไป (อย่างน้อย 5 ตัวอักษร)")
      .max(120, "หัวข้อยาวเกิน 120 ตัวอักษร"),
    detail: z
      .string()
      .trim()
      .min(10, "กรุณาใส่รายละเอียดอย่างน้อย 10 ตัวอักษร (เกรด/ความชื้น/ขนาด/บรรจุ)")
      .max(4000, "รายละเอียดยาวเกิน 4,000 ตัวอักษร"),
    category: z.enum(categoryValues, { message: "กรุณาเลือกหมวดหมู่" }),
    province: z.enum(provinceNames, { message: "กรุณาเลือกจังหวัด" }),
    district: z.string().trim().max(100).optional().or(z.literal("")),
    quantity: z
      .string()
      .trim()
      .min(1, "กรุณาระบุปริมาณ เช่น 5 ตัน หรือ 300 กก./สัปดาห์")
      .max(100, "ปริมาณยาวเกินไป"),
    targetDate: z.coerce.date({ message: "วันที่ไม่ถูกต้อง" }).optional(),
    priceNote: z.string().trim().max(200, "ยาวเกินไป").optional().or(z.literal("")),
    contactPhone: z
      .string()
      .trim()
      .regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)")
      .optional()
      .or(z.literal("")),
    contactLine: z.string().trim().max(100).optional().or(z.literal("")),
  })
  .refine((data) => data.contactPhone || data.contactLine, {
    message: "ต้องมีช่องทางติดต่ออย่างน้อย 1 อย่าง (เบอร์โทร หรือ LINE)",
    path: ["contactPhone"],
  });

export type MatchPostInput = z.infer<typeof matchPostSchema>;

/** แปลง FormData จากฟอร์มโพส → object สำหรับ zod */
export function matchPostFormDataToObject(formData: FormData) {
  const rawDate = String(formData.get("targetDate") ?? "").trim();
  return {
    type: formData.get("type"),
    title: formData.get("title"),
    detail: formData.get("detail"),
    category: formData.get("category"),
    province: formData.get("province"),
    district: formData.get("district") ?? "",
    quantity: formData.get("quantity"),
    targetDate: rawDate === "" ? undefined : rawDate,
    priceNote: formData.get("priceNote") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    contactLine: formData.get("contactLine") ?? "",
  };
}

// เหตุผลปฏิเสธ (แอดมิน) — reuse แพทเทิร์นเดียวกับประกาศ
export const matchRejectSchema = z.object({
  matchPostId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(5, "กรุณาบอกเหตุผลให้ผู้โพสเข้าใจ (อย่างน้อย 5 ตัวอักษร)")
    .max(500),
});
