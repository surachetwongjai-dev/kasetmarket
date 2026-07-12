import { z } from "zod";
import { PRICE_CATEGORY_VALUES } from "@/config/priceCategories";

// จัดการรายการราคา (PriceItem)
export const priceItemSchema = z.object({
  name: z.string().trim().min(1, "ใส่ชื่อรายการ").max(100),
  category: z
    .string()
    .refine((v) => PRICE_CATEGORY_VALUES.includes(v), "หมวดไม่ถูกต้อง"),
  unit: z.string().trim().min(1, "ใส่หน่วย เช่น บาท/กก.").max(30),
  sourceName: z.string().trim().max(100).optional(),
  sourceUrl: z
    .union([z.string().trim().url("ลิงก์ไม่ถูกต้อง").max(300), z.literal("")])
    .optional(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
});

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
