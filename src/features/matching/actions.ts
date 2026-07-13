"use server";

// Server Actions กระดานจับคู่ซื้อขาย (B1) — reuse กติกาเดิมจากประกาศ
// verified→ACTIVE, ไม่ verified→PENDING · rate limit 3/วัน · จัดการเฉพาะของตัวเอง · แอดมิน approve/reject

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { generateSlug } from "@/lib/slug";
import {
  matchPostFormDataToObject,
  matchPostSchema,
  matchRejectSchema,
  MATCH_DAILY_LIMIT,
} from "./schemas";

const MATCH_TTL_DAYS = 30;

export type MatchPostFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function expiryFromNow(): Date {
  return new Date(Date.now() + MATCH_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** เที่ยงคืนวันนี้เวลาไทย (UTC+7) — นับโควต้ารายวัน */
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

/** revalidate หน้า public กระดาน (B2) — เรียกได้แม้หน้ายังไม่มีตอน B1 */
function revalidatePublic(slug?: string) {
  revalidatePath("/matching");
  if (slug) revalidatePath(`/matching/${slug}`);
}

/** ลงโพสใหม่ */
export async function createMatchPostAction(
  _prev: MatchPostFormState,
  formData: FormData,
): Promise<MatchPostFormState> {
  const session = await requireSession();

  const parsed = matchPostSchema.safeParse(matchPostFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const todayCount = await prisma.matchPost.count({
    where: { userId: session.user.id, createdAt: { gte: startOfBangkokDay() } },
  });
  if (todayCount >= MATCH_DAILY_LIMIT) {
    return {
      error: `โพสได้สูงสุด ${MATCH_DAILY_LIMIT} รายการต่อวัน — พรุ่งนี้โพสต่อได้เลย (กันสแปมเพื่อคุณภาพของกระดาน)`,
    };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { verified: true, banned: true },
  });
  if (user.banned) {
    return { error: "บัญชีของคุณถูกระงับการใช้งาน — ติดต่อแอดมินหากมีข้อสงสัย" };
  }
  const status = user.verified ? "ACTIVE" : "PENDING";

  const { district, contactPhone, contactLine, targetDate, priceNote, ...fields } =
    parsed.data;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.matchPost.create({
        data: {
          ...fields,
          slug: generateSlug(fields.title, fields.province),
          district: district || null,
          contactPhone: contactPhone || null,
          contactLine: contactLine || null,
          targetDate: targetDate ?? null,
          priceNote: priceNote || null,
          status,
          expiresAt: expiryFromNow(),
          userId: session.user.id,
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

  revalidatePath("/dashboard/matching");
  if (status === "ACTIVE") revalidatePublic();
  redirect(
    status === "ACTIVE"
      ? "/dashboard/matching?created=active"
      : "/dashboard/matching?created=pending",
  );
}

/** แก้ไขโพส (เจ้าของเท่านั้น) — REJECTED → กลับเข้าคิว PENDING */
export async function updateMatchPostAction(
  matchPostId: string,
  _prev: MatchPostFormState,
  formData: FormData,
): Promise<MatchPostFormState> {
  const session = await requireSession();

  const parsed = matchPostSchema.safeParse(matchPostFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const post = await prisma.matchPost.findUnique({
    where: { id: matchPostId },
    select: { userId: true, slug: true, status: true },
  });
  if (!post || post.userId !== session.user.id) {
    return { error: "ไม่พบโพส หรือคุณไม่ใช่เจ้าของโพสนี้" };
  }

  const { district, contactPhone, contactLine, targetDate, priceNote, ...fields } =
    parsed.data;

  await prisma.matchPost.update({
    where: { id: matchPostId },
    data: {
      ...fields,
      district: district || null,
      contactPhone: contactPhone || null,
      contactLine: contactLine || null,
      targetDate: targetDate ?? null,
      priceNote: priceNote || null,
      ...(post.status === "REJECTED"
        ? { status: "PENDING" as const, rejectReason: null }
        : {}),
    },
  });

  revalidatePath("/dashboard/matching");
  revalidatePublic(post.slug);
  redirect("/dashboard/matching?updated=1");
}

// ---------- ปุ่มในตาราง (form action ธรรมดา) ----------

async function ownPostOrNull(matchPostId: string, userId: string) {
  const post = await prisma.matchPost.findUnique({
    where: { id: matchPostId },
    select: { id: true, userId: true, status: true, slug: true },
  });
  return post && post.userId === userId ? post : null;
}

/** จับคู่แล้ว → MATCHED (หายจากบอร์ด) */
export async function markMatchedAction(formData: FormData) {
  const session = await requireSession();
  const post = await ownPostOrNull(String(formData.get("id")), session.user.id);
  if (!post) return;
  await prisma.matchPost.update({
    where: { id: post.id },
    data: { status: "MATCHED" },
  });
  revalidatePath("/dashboard/matching");
  revalidatePublic(post.slug);
}

/** ต่ออายุ +30 วัน — EXPIRED → ACTIVE (verified) หรือ PENDING */
export async function renewMatchPostAction(formData: FormData) {
  const session = await requireSession();
  const post = await ownPostOrNull(String(formData.get("id")), session.user.id);
  if (!post) return;

  let status = post.status;
  if (status === "EXPIRED") {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { verified: true },
    });
    status = user.verified ? "ACTIVE" : "PENDING";
  }

  await prisma.matchPost.update({
    where: { id: post.id },
    data: { expiresAt: expiryFromNow(), status },
  });
  revalidatePath("/dashboard/matching");
  revalidatePublic(post.slug);
}

/** ลบโพส (ถาวร) */
export async function deleteMatchPostAction(formData: FormData) {
  const session = await requireSession();
  const post = await ownPostOrNull(String(formData.get("id")), session.user.id);
  if (!post) return;
  await prisma.matchPost.delete({ where: { id: post.id } });
  revalidatePath("/dashboard/matching");
  revalidatePublic(post.slug);
}

// ---------- แอดมิน (moderation) ----------

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return session;
}

function revalidateAdminAndPublic(slug?: string) {
  revalidatePath("/admin", "layout");
  revalidatePublic(slug);
}

/** อนุมัติโพส PENDING → ACTIVE */
export async function approveMatchPostAction(formData: FormData) {
  await requireAdmin();
  const post = await prisma.matchPost.update({
    where: { id: String(formData.get("id")) },
    data: { status: "ACTIVE", rejectReason: null },
    select: { slug: true },
  });
  revalidateAdminAndPublic(post.slug);
}

export type MatchRejectState = { error?: string };

/** ปฏิเสธโพสพร้อมเหตุผล (ผู้โพสเห็นใน dashboard) */
export async function rejectMatchPostAction(
  _prev: MatchRejectState,
  formData: FormData,
): Promise<MatchRejectState> {
  await requireAdmin();
  const parsed = matchRejectSchema.safeParse({
    matchPostId: formData.get("matchPostId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const post = await prisma.matchPost.update({
    where: { id: parsed.data.matchPostId },
    data: { status: "REJECTED", rejectReason: parsed.data.reason },
    select: { slug: true },
  });
  revalidateAdminAndPublic(post.slug);
  return {};
}
