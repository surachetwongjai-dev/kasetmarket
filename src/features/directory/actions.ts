"use server";

// Server Actions ของ directory (D5): ลงทะเบียนร้าน (public) + งานแอดมิน (approve/reject/แก้ไข/featured)

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { generateSlug } from "@/lib/slug";
import { getShopCategory } from "@/config/shopCategories";
import { shopSchema, shopFormDataToObject } from "./schemas";

export type ShopFormState = { error?: string };

// ---------- revalidate ----------
// หมายเหตุ: revalidatePath ใช้ path ภายใน /shops (route จริง) ไม่ใช่ URL ไทย /ร้านค้า (rewrite)

function revalidateShopPages(shop: {
  slug: string;
  province: string;
  categories: string[];
}) {
  revalidatePath("/shops");
  revalidatePath(`/shops/${shop.province}`);
  for (const value of shop.categories) {
    const category = getShopCategory(value);
    if (!category) continue;
    revalidatePath(`/shops/${shop.province}/${category.slug}`);
    revalidatePath(`/shops/${shop.province}/${category.slug}/${shop.slug}`);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}

// ---------- ลงทะเบียนร้าน (public — ไม่บังคับล็อกอิน) ----------

// rate limit ต่อ IP แบบ in-memory (ต่อ instance — บน serverless รีเซ็ตเมื่อ cold start,
// มี global cap จาก DB เป็นชั้นที่สองที่คงทนกว่า)
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 3;
const MAX_GLOBAL_PER_WINDOW = 20;
const submitHits = new Map<string, number[]>();

function allowSubmit(ip: string): boolean {
  const now = Date.now();
  const recent = (submitHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_IP) return false;
  recent.push(now);
  submitHits.set(ip, recent);
  if (submitHits.size > 5000) submitHits.clear();
  return true;
}

export async function submitShopAction(
  _prev: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  // honeypot: ช่อง "website" ซ่อนจากคนจริง — bot กรอกมา → ตอบสำเร็จเงียบๆ ไม่บันทึก
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect(encodeURI("/ลงทะเบียนร้านค้า/สำเร็จ"));
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowSubmit(ip)) {
    return { error: "ส่งข้อมูลถี่เกินไป กรุณาลองใหม่ในอีก 1 ชั่วโมง" };
  }

  // global cap กันสแปมยิงข้าม instance: คำขอใหม่ทั้งระบบไม่เกิน 20 ร้าน/ชม.
  const recentCount = await prisma.shop.count({
    where: { createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
  });
  if (recentCount >= MAX_GLOBAL_PER_WINDOW) {
    return {
      error: "ขณะนี้มีคำขอลงทะเบียนจำนวนมาก กรุณาลองใหม่ภายหลัง",
    };
  }

  const parsed = shopSchema.safeParse(shopFormDataToObject(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
    };
  }
  const input = parsed.data;

  const data = {
    name: input.name,
    categories: input.categories,
    province: input.province,
    district: input.district || null,
    address: input.address || null,
    phone: input.phone || null,
    lineId: input.lineId || null,
    facebookUrl: input.facebookUrl || null,
    openHours: input.openHours || null,
    description:
      input.description ||
      `ร้าน${input.categories
        .map((v) => getShopCategory(v)?.label ?? v)
        .join(" · ")} ในพื้นที่${input.district ? ` อ.${input.district}` : ""} จ.${input.province} ติดต่อสอบถามสินค้าและราคาได้โดยตรง`,
    status: "PENDING" as const, // ฟอร์ม public เข้าคิวรอแอดมินตรวจเสมอ (§10)
    images: {
      create: input.images.map((img, order) => ({ url: img.url, order })),
    },
  };

  // slug ชนแล้ว retry (แพทเทิร์นเดียวกับ createListingAction M5)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.shop.create({
        data: { ...data, slug: generateSlug(input.name, input.province) },
      });
      break;
    } catch (error) {
      const isP2002 =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!isP2002) throw error;
      const target = String(
        (error.meta?.target as string[] | string | undefined) ?? "",
      );
      // ชื่อร้านซ้ำในจังหวัดเดียวกัน (natural key) — ไม่ใช่เรื่อง retry
      if (target.includes("name")) {
        return {
          error:
            "มีร้านชื่อนี้ในจังหวัดนี้อยู่แล้ว หากเป็นร้านของคุณและต้องการแก้ข้อมูล กรุณาติดต่อทีมงาน",
        };
      }
      if (attempt === 2) throw error; // slug ชน 3 ครั้งติด — ปล่อย error จริง
    }
  }

  revalidatePath("/admin", "layout"); // ตัวเลขคิวร้านบน dashboard แอดมิน
  redirect(encodeURI("/ลงทะเบียนร้านค้า/สำเร็จ"));
}

// ---------- แอดมินเท่านั้น ----------

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return session;
}

/** อนุมัติร้าน PENDING → APPROVED (ขึ้นหน้า directory + เข้า sitemap) */
export async function approveShopAction(formData: FormData) {
  await requireAdmin();
  const shop = await prisma.shop.update({
    where: { id: String(formData.get("id")) },
    data: { status: "APPROVED" },
    select: { slug: true, province: true, categories: true },
  });
  revalidateShopPages(shop);
}

/** ปฏิเสธร้าน (ข้อมูลไม่จริง/ซ้ำ/สแปม) — ไม่มีบัญชีเจ้าของร้าน จึงไม่ต้องเก็บเหตุผล */
export async function rejectShopAction(formData: FormData) {
  await requireAdmin();
  const shop = await prisma.shop.update({
    where: { id: String(formData.get("id")) },
    data: { status: "REJECTED" },
    select: { slug: true, province: true, categories: true },
  });
  revalidateShopPages(shop);
}

/** ตั้ง/ถอดร้านแนะนำ */
export async function toggleShopFeaturedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const shop = await prisma.shop.findUniqueOrThrow({
    where: { id },
    select: { featured: true, slug: true, province: true, categories: true },
  });
  await prisma.shop.update({
    where: { id },
    data: { featured: !shop.featured },
  });
  revalidateShopPages(shop);
}

/** แก้ข้อมูลร้าน (admin) — แทนที่รูปทั้งชุดตามลำดับใหม่ (แพทเทิร์นเดียวกับแก้ประกาศ M5) */
export async function updateShopAction(
  _prev: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  await requireAdmin();
  const id = String(formData.get("id"));

  const parsed = shopSchema.safeParse(shopFormDataToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const input = parsed.data;

  const before = await prisma.shop.findUnique({
    where: { id },
    select: { slug: true, province: true, categories: true },
  });
  if (!before) return { error: "ไม่พบร้านนี้" };

  try {
    await prisma.shop.update({
      where: { id },
      data: {
        name: input.name,
        categories: input.categories,
        province: input.province,
        district: input.district || null,
        address: input.address || null,
        phone: input.phone || null,
        lineId: input.lineId || null,
        facebookUrl: input.facebookUrl || null,
        openHours: input.openHours || null,
        ...(input.description ? { description: input.description } : {}),
        images: {
          deleteMany: {},
          create: input.images.map((img, order) => ({ url: img.url, order })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "มีร้านชื่อนี้ในจังหวัดนี้อยู่แล้ว" };
    }
    throw error;
  }

  // revalidate ทั้งหน้าเดิม (จังหวัด/หมวดเก่า) และหน้าใหม่หลังแก้
  revalidateShopPages(before);
  revalidateShopPages({ ...before, province: input.province, categories: input.categories });
  redirect("/admin/shops");
}
