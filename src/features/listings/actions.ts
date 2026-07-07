"use server";

// Server Actions ของประกาศ (สร้าง/แก้ไข/ปิดการขาย/ต่ออายุ/ลบ)
// ทุก action ตรวจ session + ความเป็นเจ้าของเสมอ

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { generateSlug } from "@/lib/slug";
import { listingFormDataToObject, listingSchema } from "./schemas";

const LISTING_TTL_DAYS = 30;
const DAILY_LIMIT = 5; // 5 ประกาศ/วัน/user (CLAUDE.md §8)

export type ListingFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function expiryFromNow(): Date {
  return new Date(Date.now() + LISTING_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** เที่ยงคืนวันนี้เวลาไทย (Asia/Bangkok = UTC+7) — ใช้นับโควต้ารายวัน */
function startOfBangkokDay(): Date {
  const bkk = new Date(Date.now() + 7 * 3600 * 1000);
  return new Date(
    Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate()) -
      7 * 3600 * 1000,
  );
}

async function requireSession() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

/** revalidate หน้า public ที่เกี่ยวข้อง (ISR on-demand — CLAUDE.md §2) */
function revalidatePublic(slug?: string) {
  revalidatePath("/listings");
  if (slug) revalidatePath(`/listings/${slug}`);
}

/** ลงประกาศใหม่ */
export async function createListingAction(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const session = await requireSession();

  const parsed = listingSchema.safeParse(listingFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // rate limit: นับประกาศที่สร้างวันนี้ (เวลาไทย)
  const todayCount = await prisma.listing.count({
    where: { sellerId: session.user.id, createdAt: { gte: startOfBangkokDay() } },
  });
  if (todayCount >= DAILY_LIMIT) {
    return {
      error: `ลงประกาศได้สูงสุด ${DAILY_LIMIT} ประกาศต่อวัน — พรุ่งนี้ลงต่อได้เลย (กันสแปมเพื่อคุณภาพของเว็บ)`,
    };
  }

  // user ที่ verified แล้ว → ACTIVE ทันที, ยังไม่ verified → เข้าคิวรออนุมัติ (CLAUDE.md §8)
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { verified: true },
  });
  const status = user.verified ? "ACTIVE" : "PENDING";

  const { images, district, contactPhone, contactLine, ...fields } =
    parsed.data;

  // slug ชนกันได้ (โอกาสต่ำ) → ลองใหม่สูงสุด 3 ครั้ง
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.listing.create({
        data: {
          ...fields,
          slug: generateSlug(fields.title, fields.province),
          district: district || null,
          contactPhone: contactPhone || null,
          contactLine: contactLine || null,
          status,
          expiresAt: expiryFromNow(),
          sellerId: session.user.id,
          images: {
            create: images.map((img, i) => ({ url: img.url, order: i })),
          },
        },
      });
      break;
    } catch (error) {
      const isSlugCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!isSlugCollision || attempt === 2) throw error;
    }
  }

  revalidatePath("/dashboard/listings");
  if (status === "ACTIVE") revalidatePublic();
  redirect(
    status === "ACTIVE"
      ? "/dashboard/listings?created=active"
      : "/dashboard/listings?created=pending",
  );
}

/** แก้ไขประกาศ (เจ้าของเท่านั้น) — สถานะคงเดิม */
export async function updateListingAction(
  listingId: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const session = await requireSession();

  const parsed = listingSchema.safeParse(listingFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, slug: true },
  });
  if (!listing || listing.sellerId !== session.user.id) {
    return { error: "ไม่พบประกาศ หรือคุณไม่ใช่เจ้าของประกาศนี้" };
  }

  const { images, district, contactPhone, contactLine, ...fields } =
    parsed.data;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...fields,
      district: district || null,
      contactPhone: contactPhone || null,
      contactLine: contactLine || null,
      images: {
        deleteMany: {}, // แทนที่รูปทั้งชุดตามลำดับใหม่จากฟอร์ม
        create: images.map((img, i) => ({ url: img.url, order: i })),
      },
    },
  });

  revalidatePath("/dashboard/listings");
  revalidatePublic(listing.slug);
  redirect("/dashboard/listings?updated=1");
}

// ---------- actions จากปุ่มในตาราง (form action ธรรมดา) ----------

async function ownListingOrNull(listingId: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true, slug: true },
  });
  return listing && listing.sellerId === userId ? listing : null;
}

/** ปิดการขาย (ขายแล้ว) */
export async function markSoldAction(formData: FormData) {
  const session = await requireSession();
  const listing = await ownListingOrNull(
    String(formData.get("id")),
    session.user.id,
  );
  if (!listing) return;

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: "SOLD" },
  });
  revalidatePath("/dashboard/listings");
  revalidatePublic(listing.slug);
}

/** ต่ออายุ +30 วัน — ถ้าหมดอายุไปแล้วให้กลับมา ACTIVE (verified) หรือ PENDING */
export async function renewListingAction(formData: FormData) {
  const session = await requireSession();
  const listing = await ownListingOrNull(
    String(formData.get("id")),
    session.user.id,
  );
  if (!listing) return;

  let status = listing.status;
  if (status === "EXPIRED") {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { verified: true },
    });
    status = user.verified ? "ACTIVE" : "PENDING";
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: { expiresAt: expiryFromNow(), status },
  });
  revalidatePath("/dashboard/listings");
  revalidatePublic(listing.slug);
}

/** ลบประกาศ (ลบจริง — รูปใน DB ลบตาม cascade) */
export async function deleteListingAction(formData: FormData) {
  const session = await requireSession();
  const listing = await ownListingOrNull(
    String(formData.get("id")),
    session.user.id,
  );
  if (!listing) return;

  await prisma.listing.delete({ where: { id: listing.id } });
  revalidatePath("/dashboard/listings");
  revalidatePublic(listing.slug);
}
