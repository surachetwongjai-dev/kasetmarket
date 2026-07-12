// Queries รีวิวผู้ขาย (T2) — ฝั่ง public เห็นเฉพาะรีวิวที่ไม่ถูกซ่อน (hidden=false)

import { prisma } from "@/lib/prisma";
import { REVIEW_ELIGIBLE_HOURS } from "./schemas";

/** ดาวเฉลี่ย + จำนวนรีวิว (นับเฉพาะที่ไม่ถูกซ่อน) — ใช้บนโปรไฟล์ + กล่องผู้ขายในหน้าประกาศ */
export async function getSellerRatingSummary(
  sellerId: string,
): Promise<{ avg: number; count: number }> {
  const agg = await prisma.sellerReview.aggregate({
    where: { sellerId, hidden: false },
    _avg: { rating: true },
    _count: true,
  });
  return { avg: agg._avg.rating ?? 0, count: agg._count };
}

/** รีวิวทั้งหมดของผู้ขาย (ไม่ถูกซ่อน) — ใหม่สุดก่อน */
export async function getSellerReviews(sellerId: string) {
  return prisma.sellerReview.findMany({
    where: { sellerId, hidden: false },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      rating: true,
      comment: true,
      sellerReply: true,
      createdAt: true,
      reviewerId: true,
      reviewer: { select: { id: true, name: true, image: true } },
      listing: { select: { slug: true, title: true } },
    },
  });
}

export type SellerReviewView = Awaited<
  ReturnType<typeof getSellerReviews>
>[number];

export type ReviewEligibility =
  | { canReview: false; reason: "not-logged-in" | "self" | "need-reveal" | "reveal-too-recent" }
  | {
      canReview: true;
      existingReview: {
        id: string;
        rating: number;
        comment: string | null;
        hidden: boolean;
      } | null;
      suggestedListingId: string | null;
    };

/**
 * ผู้ชมรีวิวผู้ขายรายนี้ได้ไหม (กันรีวิวปลอม T2):
 *  - ต้องล็อกอิน · ห้ามรีวิวตัวเอง
 *  - ถ้ามีรีวิวเดิม → แก้/ลบได้เสมอ
 *  - ถ้ายังไม่มี → ต้องเคยกดดูช่องทางติดต่อ (ContactReveal) ของประกาศผู้ขายรายนี้ มาแล้ว ≥24 ชม.
 */
export async function getReviewEligibility(
  sellerId: string,
  viewerId?: string | null,
): Promise<ReviewEligibility> {
  if (!viewerId) return { canReview: false, reason: "not-logged-in" };
  if (viewerId === sellerId) return { canReview: false, reason: "self" };

  const existingReview = await prisma.sellerReview.findUnique({
    where: { sellerId_reviewerId: { sellerId, reviewerId: viewerId } },
    select: { id: true, rating: true, comment: true, hidden: true },
  });
  if (existingReview) {
    return { canReview: true, existingReview, suggestedListingId: null };
  }

  // reveal เก่าสุดของผู้ชมบนประกาศของผู้ขายรายนี้
  const reveal = await prisma.contactReveal.findFirst({
    where: { userId: viewerId, listing: { sellerId } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true, listingId: true },
  });
  if (!reveal) return { canReview: false, reason: "need-reveal" };

  const cutoff = new Date(Date.now() - REVIEW_ELIGIBLE_HOURS * 3600 * 1000);
  if (reveal.createdAt > cutoff) {
    return { canReview: false, reason: "reveal-too-recent" };
  }
  return {
    canReview: true,
    existingReview: null,
    suggestedListingId: reveal.listingId,
  };
}

/** คิวรายงานรีวิวสำหรับแอดมิน — ค้างตรวจขึ้นก่อน */
export async function getReviewReportsForAdmin() {
  return prisma.reviewReport.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
          sellerReply: true,
          hidden: true,
          createdAt: true,
          seller: { select: { id: true, name: true } },
          reviewer: { select: { id: true, name: true } },
        },
      },
    },
  });
}

/** จำนวนรายงานรีวิวค้างตรวจ (การ์ดภาพรวมแอดมิน) */
export async function getOpenReviewReportCount(): Promise<number> {
  return prisma.reviewReport.count({ where: { resolved: false } });
}
