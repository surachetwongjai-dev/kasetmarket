// Queries กระดานจับคู่ซื้อขาย (B1 dashboard/admin + B2 public)

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** โพสทั้งหมดของ user (จัดการใน dashboard) */
export async function getMyMatchPosts(userId: string) {
  return prisma.matchPost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/** โพสของ user สำหรับหน้าแก้ไข (ตรวจ ownership) */
export async function getMyMatchPostForEdit(id: string, userId: string) {
  const post = await prisma.matchPost.findUnique({ where: { id } });
  if (!post || post.userId !== userId) return null;
  return post;
}

/** คิว PENDING สำหรับแอดมิน (เก่าสุดก่อน) */
export async function getPendingMatchPosts() {
  return prisma.matchPost.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, verified: true, banned: true },
      },
    },
  });
}

/** จำนวนโพส PENDING (การ์ดภาพรวมแอดมิน) */
export async function getPendingMatchPostCount() {
  return prisma.matchPost.count({ where: { status: "PENDING" } });
}

// ---------- public (B2) ----------

export const MATCH_PAGE_SIZE = 24;

/** เงื่อนไขโพสที่แสดงบนกระดานสาธารณะ (ACTIVE + ยังไม่หมดอายุ) */
function publicMatchWhere(): Prisma.MatchPostWhereInput {
  return { status: "ACTIVE", expiresAt: { gt: new Date() } };
}

export type PublicMatchParams = {
  type: "SUPPLY" | "DEMAND";
  category?: string;
  province?: string;
  sort?: "nearest" | "newest";
  page?: number;
};

const posterSelect = {
  select: { id: true, name: true, verified: true },
};

export async function getPublicMatchPosts(params: PublicMatchParams) {
  const { type, category, province, sort = "newest", page = 1 } = params;
  const where: Prisma.MatchPostWhereInput = {
    ...publicMatchWhere(),
    type,
    ...(category ? { category } : {}),
    ...(province ? { province } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.matchPost.count({ where }),
    prisma.matchPost.findMany({
      where,
      orderBy:
        sort === "nearest"
          ? [{ targetDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
      skip: (page - 1) * MATCH_PAGE_SIZE,
      take: MATCH_PAGE_SIZE,
      include: { user: posterSelect },
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / MATCH_PAGE_SIZE)),
  };
}

/** จำนวนโพส ACTIVE แต่ละ type (นับป้ายบนแท็บ — เคารพ filter หมวด/จังหวัด แต่ไม่รวม type) */
export async function getMatchTypeCounts(category?: string, province?: string) {
  const where: Prisma.MatchPostWhereInput = {
    ...publicMatchWhere(),
    ...(category ? { category } : {}),
    ...(province ? { province } : {}),
  };
  const grouped = await prisma.matchPost.groupBy({
    by: ["type"],
    where,
    _count: { _all: true },
  });
  const counts = { SUPPLY: 0, DEMAND: 0 };
  for (const g of grouped) counts[g.type] = g._count._all;
  return counts;
}

export async function getActiveMatchPostBySlug(slug: string) {
  return prisma.matchPost.findFirst({
    where: { ...publicMatchWhere(), slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          verified: true,
          province: true,
          createdAt: true,
        },
      },
    },
  });
}

/** cross-link: โพสฝั่งตรงข้าม (SUPPLY↔DEMAND) หมวดเดียวกัน จังหวัดเดียวกันก่อน */
export async function getRelatedMatchPosts(post: {
  id: string;
  type: "SUPPLY" | "DEMAND";
  category: string;
  province: string;
}) {
  const LIMIT = 4;
  const opposite = post.type === "SUPPLY" ? "DEMAND" : "SUPPLY";
  const base: Prisma.MatchPostWhereInput = {
    ...publicMatchWhere(),
    type: opposite,
    category: post.category,
    id: { not: post.id },
  };
  const sameProvince = await prisma.matchPost.findMany({
    where: { ...base, province: post.province },
    orderBy: { createdAt: "desc" },
    take: LIMIT,
    include: { user: posterSelect },
  });
  if (sameProvince.length >= LIMIT) return sameProvince;
  const others = await prisma.matchPost.findMany({
    where: { ...base, province: { not: post.province } },
    orderBy: { createdAt: "desc" },
    take: LIMIT - sameProvince.length,
    include: { user: posterSelect },
  });
  return [...sameProvince, ...others];
}

/** จำนวนโพส ACTIVE ตาม type+หมวด — ใช้ทำ cross-link บนหน้าประกาศ ("มีคนรับซื้อหมวดนี้ N ราย") */
export async function getActiveMatchCount(
  type: "SUPPLY" | "DEMAND",
  category: string,
) {
  return prisma.matchPost.count({
    where: { ...publicMatchWhere(), type, category },
  });
}

/** ประกาศขายปกติหมวดเดียวกัน (cross-link บนหน้าโพสจับคู่) — จังหวัดเดียวกันก่อน */
export async function getListingsForMatch(
  category: string,
  province: string,
  limit = 4,
) {
  const base = {
    status: "ACTIVE" as const,
    expiresAt: { gt: new Date() },
    category,
  };
  const sameProvince = await prisma.listing.findMany({
    where: { ...base, province },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
  if (sameProvince.length >= limit) return sameProvince;
  const others = await prisma.listing.findMany({
    where: { ...base, province: { not: province } },
    orderBy: { createdAt: "desc" },
    take: limit - sameProvince.length,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });
  return [...sameProvince, ...others];
}

/** slug โพส ACTIVE ทั้งหมด (sitemap) */
export async function getMatchPostsForSitemap() {
  return prisma.matchPost.findMany({
    where: publicMatchWhere(),
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

/** โพสล่าสุดสำหรับ section หน้าแรก (คละ type) */
export async function getLatestMatchPosts(limit = 6) {
  return prisma.matchPost.findMany({
    where: publicMatchWhere(),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: posterSelect },
  });
}
