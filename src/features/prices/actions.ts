"use server";

// Server Actions ราคากลาง (P1) — admin only ทุกตัว

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { generateSlug } from "@/lib/slug";
import { priceItemSchema, DATE_RE } from "./schemas";
import { dateFromStr } from "./queries";

export type PriceFormState = {
  success?: boolean;
  error?: string;
  savedCount?: number;
};

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return session;
}

/**
 * บันทึกราคาทั้งหน้าในวันเดียว (upsert ตาม itemId+date)
 * ช่อง min ว่าง = ข้ามรายการนั้น · ราคา > 0, max ≥ min
 */
export async function saveDailyPricesAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  await requireAdmin();

  const dateStr = String(formData.get("date") ?? "");
  if (!DATE_RE.test(dateStr)) return { error: "วันที่ไม่ถูกต้อง" };
  const date = dateFromStr(dateStr);

  // รวมค่าจากฟอร์ม: min_<id> / max_<id>
  type Row = { itemId: string; min: number; max: number | null };
  const rows: Row[] = [];
  for (const [key, raw] of formData.entries()) {
    if (!key.startsWith("min_")) continue;
    const minStr = String(raw).trim();
    if (minStr === "") continue; // ว่าง = ไม่บันทึก
    const itemId = key.slice(4);
    const maxStr = String(formData.get(`max_${itemId}`) ?? "").trim();

    const min = Number(minStr);
    if (!Number.isFinite(min) || min <= 0) {
      return { error: "ราคาต้องเป็นตัวเลขมากกว่า 0" };
    }
    let max: number | null = null;
    if (maxStr !== "") {
      max = Number(maxStr);
      if (!Number.isFinite(max) || max <= 0) {
        return { error: "ราคาสูงสุดต้องเป็นตัวเลขมากกว่า 0" };
      }
      if (max < min) {
        return { error: "ราคาสูงสุดต้องไม่น้อยกว่าราคาต่ำสุด" };
      }
    }
    rows.push({ itemId, min, max });
  }

  if (rows.length === 0) return { error: "ยังไม่ได้กรอกราคารายการใด" };

  // กรองเฉพาะ item ที่มีจริง (กัน id ปลอม)
  const validIds = new Set(
    (
      await prisma.priceItem.findMany({
        where: { id: { in: rows.map((r) => r.itemId) } },
        select: { id: true },
      })
    ).map((i) => i.id),
  );
  const valid = rows.filter((r) => validIds.has(r.itemId));

  await prisma.$transaction(
    valid.map((r) =>
      prisma.priceEntry.upsert({
        where: { itemId_date: { itemId: r.itemId, date } },
        create: {
          itemId: r.itemId,
          date,
          priceMin: new Prisma.Decimal(r.min),
          priceMax: r.max === null ? null : new Prisma.Decimal(r.max),
        },
        update: {
          priceMin: new Prisma.Decimal(r.min),
          priceMax: r.max === null ? null : new Prisma.Decimal(r.max),
        },
      }),
    ),
  );

  revalidatePath("/admin/prices");
  return { success: true, savedCount: valid.length };
}

/** เพิ่มรายการราคาใหม่ */
export async function createPriceItemAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  await requireAdmin();
  const parsed = priceItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    unit: formData.get("unit"),
    sourceName: formData.get("sourceName") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    order: formData.get("order") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const d = parsed.data;

  const last = await prisma.priceItem.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = d.order ?? (last?.order ?? 0) + 1;

  // slug ไทยจากชื่อ + retry ถ้าชน
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.priceItem.create({
        data: {
          slug: generateSlug(d.name),
          name: d.name,
          category: d.category,
          unit: d.unit,
          sourceName: d.sourceName || null,
          sourceUrl: d.sourceUrl || null,
          order,
        },
      });
      revalidatePath("/admin/prices");
      return { success: true };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
        continue; // slug ชน — ลองใหม่ (suffix สุ่มใหม่)
      throw e;
    }
  }
  return { error: "สร้างรายการไม่สำเร็จ ลองใหม่อีกครั้ง" };
}

/** แก้รายการราคา (คง slug เดิม — กัน URL P2 เปลี่ยน) */
export async function updatePriceItemAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = priceItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    unit: formData.get("unit"),
    sourceName: formData.get("sourceName") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    order: formData.get("order") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const d = parsed.data;
  await prisma.priceItem.update({
    where: { id },
    data: {
      name: d.name,
      category: d.category,
      unit: d.unit,
      sourceName: d.sourceName || null,
      sourceUrl: d.sourceUrl || null,
      ...(d.order !== undefined ? { order: d.order } : {}),
    },
  });
  revalidatePath("/admin/prices");
  return { success: true };
}

/** เปิด/ปิดการใช้งานรายการ (ปิด = ไม่ขึ้นหน้ากรอก/หน้า public) */
export async function togglePriceItemActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const item = await prisma.priceItem.findUniqueOrThrow({
    where: { id },
    select: { active: true },
  });
  await prisma.priceItem.update({
    where: { id },
    data: { active: !item.active },
  });
  revalidatePath("/admin/prices");
}
