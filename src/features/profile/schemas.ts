import { z } from "zod";
import { PROVINCES } from "@/config/provinces";
import { FARM_TYPES } from "@/config/farmTypes";

// โปรไฟล์เกษตรกร (U1) — validate ฝั่ง server ทุก mutation
const provinceNames = PROVINCES.map((p) => p.name) as [string, ...string[]];
const farmTypeValues = FARM_TYPES.map((t) => t.value) as [string, ...string[]];

export const MAX_FARM_PROFILE_IMAGES = 4;
export const MAX_BIO = 1000;
export const MAX_PRODUCTS = 200;
export const MAX_SIZE_RAI = 1_000_000;
export const PROFILE_DAILY_LIMIT = 10; // แก้โปรไฟล์ 10 ครั้ง/วัน/user

export const farmProfileImageSchema = z.object({
  key: z.string().min(1),
  url: z.string().min(1),
});

export const profileSchema = z.object({
  // User.name — บังคับ (ตรงกับ schema DB ที่ name เป็น NOT NULL)
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อที่แสดง")
    .max(80, "ชื่อยาวเกิน 80 ตัวอักษร"),
  province: z
    .enum(provinceNames, { message: "จังหวัดไม่ถูกต้อง" })
    .optional()
    .or(z.literal("")),
  district: z.string().trim().max(100, "ชื่ออำเภอยาวเกินไป").optional().or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(MAX_BIO, `แนะนำตัวยาวเกิน ${MAX_BIO} ตัวอักษร`)
    .optional()
    .or(z.literal("")),
  farmTypes: z.array(z.enum(farmTypeValues)).max(FARM_TYPES.length),
  products: z
    .string()
    .trim()
    .max(MAX_PRODUCTS, `สินค้าหลักยาวเกิน ${MAX_PRODUCTS} ตัวอักษร`)
    .optional()
    .or(z.literal("")),
  sizeRai: z.coerce
    .number({ message: "ขนาดพื้นที่ต้องเป็นตัวเลข" })
    .int("ขนาดพื้นที่ต้องเป็นจำนวนเต็ม")
    .min(0, "ขนาดพื้นที่ต้องไม่ติดลบ")
    .max(MAX_SIZE_RAI, "ขนาดพื้นที่สูงเกินไป")
    .optional(),
  images: z
    .array(farmProfileImageSchema)
    .max(MAX_FARM_PROFILE_IMAGES, `ใส่รูปได้สูงสุด ${MAX_FARM_PROFILE_IMAGES} รูป`),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** แปลง FormData จากฟอร์มโปรไฟล์ → object สำหรับ zod */
export function profileFormDataToObject(formData: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = [];
  }
  const rawSize = String(formData.get("sizeRai") ?? "").trim();
  return {
    name: formData.get("name"),
    province: formData.get("province") ?? "",
    district: formData.get("district") ?? "",
    bio: formData.get("bio") ?? "",
    // checkbox หลายค่า ชื่อเดียวกัน → getAll
    farmTypes: formData.getAll("farmTypes").map(String),
    products: formData.get("products") ?? "",
    sizeRai: rawSize === "" ? undefined : rawSize,
    images,
  };
}
