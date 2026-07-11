// Seed ร้านค้า directory จาก CSV (D1 — CLAUDE.md §10)
// ใช้: npx tsx scripts/seed-shops.ts <ไฟล์.csv>   (ตัวอย่าง: prisma/shops-sample.csv)
//
// คอลัมน์บังคับ: name, categories, province
// คอลัมน์เสริม: district, address, phone, lineId, facebookUrl, openHours, description, lat, lng
// - categories คั่นหลายหมวดด้วย "|" — ใส่ได้ทั้ง value ascii (fertilizer-chem) หรือ label ไทย (ปุ๋ย-เคมีเกษตร)
// - upsert ด้วย natural key (name, province) → รันซ้ำได้ไม่ duplicate, slug เดิมคงอยู่ (URL ไม่เปลี่ยน)
// - แถวที่สร้างใหม่ตั้ง APPROVED ทันที (ข้อมูลจากแอดมิน) แต่แถวที่มีอยู่แล้วไม่แตะ status
//   (ร้านที่แอดมิน reject ไปแล้วจะไม่ถูกปลุกกลับมาโดย seed)
// - validate ทั้งไฟล์ก่อน ถ้ามี error แม้แถวเดียว → ไม่เขียนอะไรเลย (all-or-nothing)

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { generateSlug } from "../src/lib/slug";
import { PROVINCES } from "../src/config/provinces";
import {
  SHOP_CATEGORIES,
  getShopCategoryLabel,
} from "../src/config/shopCategories";

const prisma = new PrismaClient();

const PROVINCE_NAMES = new Set(PROVINCES.map((p) => p.name));

/** แปลงค่าในคอลัมน์ categories (value หรือ label ไทย) → value ascii */
function toCategoryValue(raw: string): string | null {
  const s = raw.trim();
  const hit = SHOP_CATEGORIES.find((c) => c.value === s || c.label === s);
  return hit ? hit.value : null;
}

const rowSchema = z.object({
  name: z.string().trim().min(2, "ชื่อร้านสั้นเกินไป"),
  categories: z
    .string()
    .trim()
    .min(1, "ต้องมีอย่างน้อย 1 หมวด")
    .transform((s, ctx) => {
      const parts = s.split(/[|;]/).map((p) => p.trim()).filter(Boolean);
      const values: string[] = [];
      for (const p of parts) {
        const v = toCategoryValue(p);
        if (!v) {
          ctx.addIssue({ code: "custom", message: `ไม่รู้จักหมวดร้าน "${p}"` });
          return z.NEVER;
        }
        if (!values.includes(v)) values.push(v);
      }
      return values;
    }),
  province: z
    .string()
    .trim()
    .refine((p) => PROVINCE_NAMES.has(p), "ชื่อจังหวัดไม่ตรง config/provinces.ts"),
  district: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  lineId: z.string().trim().optional(),
  facebookUrl: z.string().trim().optional(),
  openHours: z.string().trim().optional(),
  description: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

/** parse CSV รองรับค่าใน "..." (มี comma/ขึ้นบรรทัดใหม่ข้างในได้) */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, ""); // ตัด BOM
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("ใช้: npx tsx scripts/seed-shops.ts <ไฟล์.csv>");
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(file, "utf8"));
  if (rows.length < 2) throw new Error("CSV ต้องมี header + ข้อมูลอย่างน้อย 1 แถว");

  const header = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((cells) =>
    Object.fromEntries(
      header.map((key, i) => [key, (cells[i] ?? "").trim()]).filter(([, v]) => v !== ""),
    ),
  );

  // validate ทั้งไฟล์ก่อน (all-or-nothing)
  const parsed: z.infer<typeof rowSchema>[] = [];
  const errors: string[] = [];
  records.forEach((rec, i) => {
    const result = rowSchema.safeParse(rec);
    if (result.success) parsed.push(result.data);
    else
      errors.push(
        `แถว ${i + 2}: ${result.error.issues.map((e) => `${e.path.join(".")} — ${e.message}`).join(", ")}`,
      );
  });
  if (errors.length) {
    console.error(`❌ พบ ${errors.length} ข้อผิดพลาด — ยังไม่เขียนข้อมูลใดๆ\n` + errors.join("\n"));
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  for (const shop of parsed) {
    const data = {
      description:
        shop.description ??
        `ร้าน${shop.categories.map(getShopCategoryLabel).join(" · ")} ในพื้นที่${shop.district ? ` อ.${shop.district}` : ""} จ.${shop.province} ติดต่อสอบถามสินค้าและราคาได้โดยตรง`,
      categories: shop.categories,
      district: shop.district ?? null,
      address: shop.address ?? null,
      phone: shop.phone ?? null,
      lineId: shop.lineId ?? null,
      facebookUrl: shop.facebookUrl ?? null,
      openHours: shop.openHours ?? null,
      lat: shop.lat ?? null,
      lng: shop.lng ?? null,
    };
    const existing = await prisma.shop.findUnique({
      where: { name_province: { name: shop.name, province: shop.province } },
      select: { id: true },
    });
    if (existing) {
      await prisma.shop.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.shop.create({
        data: {
          ...data,
          name: shop.name,
          province: shop.province,
          slug: generateSlug(shop.name, shop.province),
          status: "APPROVED",
        },
      });
      created++;
    }
  }

  const total = await prisma.shop.count();
  console.log(`✓ สร้างใหม่ ${created} · อัปเดต ${updated} · ร้านทั้งหมดใน DB ${total}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
