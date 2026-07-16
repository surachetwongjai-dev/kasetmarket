import { z } from "zod";
import { CATEGORIES } from "@/config/categories";
import { UNITS } from "@/config/units";
import { PROVINCES } from "@/config/provinces";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const unitValues = UNITS.map((u) => u.value) as [string, ...string[]];
const provinceNames = PROVINCES.map((p) => p.name) as [string, ...string[]];

export const MAX_LISTING_IMAGES = 6;

export const listingImageSchema = z.object({
  key: z.string().min(1),
  url: z.string().min(1),
});

export const listingSchema = z
  .object({
    listingType: z.enum(["SELL", "BUY"], { message: "กรุณาเลือกประเภทประกาศ" }),
    title: z
      .string()
      .trim()
      .min(5, "ชื่อประกาศสั้นเกินไป (อย่างน้อย 5 ตัวอักษร)")
      .max(100, "ชื่อประกาศยาวเกิน 100 ตัวอักษร"),
    description: z
      .string()
      .trim()
      .min(20, "กรุณาเขียนรายละเอียดอย่างน้อย 20 ตัวอักษร ผู้ซื้อจะได้ตัดสินใจง่าย")
      .max(4000, "รายละเอียดยาวเกิน 4,000 ตัวอักษร"),
    price: z.coerce
      .number({ message: "กรุณากรอกราคาเป็นตัวเลข" })
      .positive("ราคาต้องมากกว่า 0")
      .max(100_000_000, "ราคาสูงเกินไป")
      .refine((n) => Number.isInteger(n * 100), "ทศนิยมได้ไม่เกิน 2 ตำแหน่ง"),
    unit: z.enum(unitValues, { message: "กรุณาเลือกหน่วยขาย" }),
    negotiable: z.boolean(),
    category: z.enum(categoryValues, { message: "กรุณาเลือกหมวดหมู่" }),
    province: z.enum(provinceNames, { message: "กรุณาเลือกจังหวัด" }),
    district: z.string().trim().max(100).optional().or(z.literal("")),
    contactPhone: z
      .string()
      .trim()
      .regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)")
      .optional()
      .or(z.literal("")),
    contactLine: z.string().trim().max(100).optional().or(z.literal("")),
    images: z
      .array(listingImageSchema)
      .min(1, "กรุณาใส่รูปอย่างน้อย 1 รูป ประกาศมีรูปขายได้ดีกว่ามาก")
      .max(MAX_LISTING_IMAGES, `ใส่รูปได้สูงสุด ${MAX_LISTING_IMAGES} รูป`),
  })
  .refine((data) => data.contactPhone || data.contactLine, {
    message: "ต้องมีช่องทางติดต่ออย่างน้อย 1 อย่าง (เบอร์โทร หรือ LINE)",
    path: ["contactPhone"],
  });

export type ListingInput = z.infer<typeof listingSchema>;

/** แปลง FormData จากฟอร์มลงประกาศ → object สำหรับ zod */
export function listingFormDataToObject(formData: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = [];
  }
  return {
    listingType: formData.get("listingType"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    unit: formData.get("unit"),
    negotiable: formData.get("negotiable") === "on",
    category: formData.get("category"),
    province: formData.get("province"),
    district: formData.get("district") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    contactLine: formData.get("contactLine") ?? "",
    images,
  };
}
