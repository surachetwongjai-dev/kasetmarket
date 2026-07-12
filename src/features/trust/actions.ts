"use server";

// Server Actions รีวิวผู้ขาย (T2) — ทุก mutation re-validate ฝั่ง server เสมอ (ห้ามเชื่อ client)
// กติกากันรีวิวปลอม: ต้องกดดูช่องทางติดต่อของผู้ขายรายนั้นมาแล้ว ≥24 ชม. (หรือมีรีวิวเดิม = แก้)

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import {
  reviewSchema,
  sellerReplySchema,
  reviewReportSchema,
  REVIEW_DAILY_LIMIT,
  REVIEW_ELIGIBLE_HOURS,
} from "./schemas";

export type ReviewFormState = { success?: boolean; error?: string };

/** เที่ยงคืนวันนี้เวลาไทย (UTC+7) — นับโควต้ารายวัน (แพทเทิร์นเดียวกับ listings/moderation) */
function startOfBangkokDay(): Date {
  const bkk = new Date(Date.now() + 7 * 3600 * 1000);
  return new Date(
    Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate()) -
      7 * 3600 * 1000,
  );
}

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("ต้องเข้าสู่ระบบก่อน");
  return session;
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return session;
}

/** re-check กติกา: ไม่รีวิวตัวเอง · มีรีวิวเดิม(แก้ได้) หรือเคยกดดูเบอร์ ≥24ชม. */
async function canReviewOnServer(
  sellerId: string,
  reviewerId: string,
): Promise<boolean> {
  if (sellerId === reviewerId) return false;
  const existing = await prisma.sellerReview.findUnique({
    where: { sellerId_reviewerId: { sellerId, reviewerId } },
    select: { id: true },
  });
  if (existing) return true;
  const cutoff = new Date(Date.now() - REVIEW_ELIGIBLE_HOURS * 3600 * 1000);
  const reveal = await prisma.contactReveal.findFirst({
    where: { userId: reviewerId, listing: { sellerId }, createdAt: { lte: cutoff } },
    select: { id: true },
  });
  return Boolean(reveal);
}

/** revalidate หน้าโปรไฟล์ผู้ขาย + หน้าประกาศ ACTIVE ของเขา (ดาวเฉลี่ยเปลี่ยน) */
async function revalidateSellerSurfaces(sellerId: string) {
  revalidatePath(`/sellers/${sellerId}`);
  const listings = await prisma.listing.findMany({
    where: { sellerId, status: "ACTIVE" },
    select: { slug: true },
  });
  for (const l of listings) revalidatePath(`/listings/${l.slug}`);
}

/** เขียน/แก้รีวิว (upsert 1 รีวิว/คู่) */
export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session) return { error: "ต้องเข้าสู่ระบบก่อนรีวิว" };

  const parsed = reviewSchema.safeParse({
    sellerId: formData.get("sellerId"),
    listingId: formData.get("listingId") || undefined,
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const { sellerId, rating, comment } = parsed.data;
  const reviewerId = session.user.id;

  if (!(await canReviewOnServer(sellerId, reviewerId))) {
    return { error: "คุณยังไม่มีสิทธิ์รีวิวผู้ขายรายนี้" };
  }

  // rate limit: จำนวนรีวิวที่เขียน/แก้วันนี้ (เวลาไทย)
  const touchedToday = await prisma.sellerReview.count({
    where: { reviewerId, updatedAt: { gte: startOfBangkokDay() } },
  });
  const existing = await prisma.sellerReview.findUnique({
    where: { sellerId_reviewerId: { sellerId, reviewerId } },
    select: { id: true },
  });
  // ถ้าเกินโควต้า และไม่ใช่การแก้รีวิวที่ถูกนับไปแล้ววันนี้
  if (touchedToday >= REVIEW_DAILY_LIMIT && !existing) {
    return { error: "วันนี้รีวิวครบจำนวนแล้ว ลองใหม่พรุ่งนี้" };
  }

  // listingId ที่แนบมาต้องเป็นประกาศของผู้ขายรายนี้จริง ไม่งั้นทิ้ง (กันแนบมั่ว)
  let listingId = parsed.data.listingId ?? null;
  if (listingId) {
    const owned = await prisma.listing.findFirst({
      where: { id: listingId, sellerId },
      select: { id: true },
    });
    if (!owned) listingId = null;
  }

  await prisma.sellerReview.upsert({
    where: { sellerId_reviewerId: { sellerId, reviewerId } },
    create: { sellerId, reviewerId, listingId, rating, comment: comment || null },
    update: { rating, comment: comment || null, ...(listingId ? { listingId } : {}) },
  });

  await revalidateSellerSurfaces(sellerId);
  return { success: true };
}

/** ลบรีวิวของตัวเอง */
export async function deleteMyReviewAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const review = await prisma.sellerReview.findUnique({
    where: { id },
    select: { reviewerId: true, sellerId: true },
  });
  if (!review || review.reviewerId !== session.user.id) return;
  await prisma.sellerReview.delete({ where: { id } });
  await revalidateSellerSurfaces(review.sellerId);
}

/** ผู้ขายตอบรีวิวที่ได้รับ (แก้ได้) */
export async function replyToReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session) return { error: "ต้องเข้าสู่ระบบก่อน" };

  const parsed = sellerReplySchema.safeParse({
    reviewId: formData.get("reviewId"),
    reply: formData.get("reply"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const review = await prisma.sellerReview.findUnique({
    where: { id: parsed.data.reviewId },
    select: { sellerId: true },
  });
  if (!review || review.sellerId !== session.user.id) {
    return { error: "ตอบได้เฉพาะรีวิวที่เขียนถึงคุณ" };
  }

  await prisma.sellerReview.update({
    where: { id: parsed.data.reviewId },
    data: { sellerReply: parsed.data.reply },
  });
  await revalidateSellerSurfaces(review.sellerId);
  return { success: true };
}

/** รายงานรีวิว — ไม่บังคับล็อกอิน (กันซ้ำด้วยรายงานค้างของรีวิวเดียวกัน) */
export async function reportReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const parsed = reviewReportSchema.safeParse({
    reviewId: formData.get("reviewId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: "กรุณาเลือกเหตุผลการรายงาน" };

  const review = await prisma.sellerReview.findUnique({
    where: { id: parsed.data.reviewId },
    select: { id: true },
  });
  if (!review) return { error: "ไม่พบรีวิวนี้" };

  // มีรายงานค้างตรวจของรีวิวนี้อยู่แล้ว → ตอบสำเร็จเงียบๆ (กันซ้ำ)
  const pending = await prisma.reviewReport.count({
    where: { reviewId: review.id, resolved: false },
  });
  if (pending === 0) {
    await prisma.reviewReport.create({
      data: { reviewId: review.id, reason: parsed.data.reason },
    });
    revalidatePath("/admin", "layout");
  }
  return { success: true };
}

// ---------- แอดมิน ----------

/** ซ่อน/เลิกซ่อนรีวิว */
export async function toggleHideReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const review = await prisma.sellerReview.findUniqueOrThrow({
    where: { id },
    select: { hidden: true, sellerId: true },
  });
  await prisma.sellerReview.update({
    where: { id },
    data: { hidden: !review.hidden },
  });
  revalidatePath("/admin", "layout");
  await revalidateSellerSurfaces(review.sellerId);
}

/** ปิดงานรายงานรีวิว (ตรวจแล้ว) */
export async function resolveReviewReportAction(formData: FormData) {
  await requireAdmin();
  await prisma.reviewReport.update({
    where: { id: String(formData.get("id")) },
    data: { resolved: true },
  });
  revalidatePath("/admin", "layout");
}
