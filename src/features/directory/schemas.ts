// zod schemas ของ directory ร้านค้า (D5) — ใช้ทั้งฟอร์มลงทะเบียน (public) และฟอร์มแก้ไข (admin)

import { z } from "zod";
import { PROVINCES } from "@/config/provinces";
import { SHOP_CATEGORY_VALUES } from "@/config/shopCategories";

const provinceNames = PROVINCES.map((p) => p.name) as [string, ...string[]];
const categoryValues = SHOP_CATEGORY_VALUES as [string, ...string[]];

export const MAX_SHOP_IMAGES = 4;

export const shopImageSchema = z.object({
  key: z.string().min(1),
  url: z.string().min(1),
});

export const shopSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "ชื่อร้านสั้นเกินไป")
      .max(100, "ชื่อร้านยาวเกิน 100 ตัวอักษร"),
    categories: z
      .array(z.enum(categoryValues, { message: "หมวดร้านไม่ถูกต้อง" }))
      .min(1, "เลือกประเภทร้านอย่างน้อย 1 หมวด")
      .max(SHOP_CATEGORY_VALUES.length),
    province: z.enum(provinceNames, { message: "กรุณาเลือกจังหวัด" }),
    district: z.string().trim().max(100).optional().or(z.literal("")),
    address: z.string().trim().max(200).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^0[\d\s-]{8,12}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)")
      .optional()
      .or(z.literal("")),
    lineId: z.string().trim().max(100).optional().or(z.literal("")),
    facebookUrl: z
      .string()
      .trim()
      .url("ลิงก์ Facebook ไม่ถูกต้อง (ต้องขึ้นต้นด้วย https://)")
      .max(300)
      .optional()
      .or(z.literal("")),
    openHours: z.string().trim().max(100).optional().or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(2000, "คำแนะนำร้านยาวเกิน 2,000 ตัวอักษร")
      .optional()
      .or(z.literal("")),
    images: z
      .array(shopImageSchema)
      .max(MAX_SHOP_IMAGES, `ใส่รูปได้สูงสุด ${MAX_SHOP_IMAGES} รูป`),
  })
  .refine((data) => data.phone || data.lineId, {
    message: "ต้องมีช่องทางติดต่ออย่างน้อย 1 อย่าง (เบอร์โทร หรือ LINE)",
    path: ["phone"],
  });

export type ShopInput = z.infer<typeof shopSchema>;

/** แปลง FormData จากฟอร์มร้าน → object สำหรับ zod */
export function shopFormDataToObject(formData: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = [];
  }
  return {
    name: formData.get("name"),
    categories: formData.getAll("categories").map(String),
    province: formData.get("province"),
    district: formData.get("district") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    lineId: formData.get("lineId") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    openHours: formData.get("openHours") ?? "",
    description: formData.get("description") ?? "",
    images,
  };
}
