// Queries ชุมชน (C1 public) — hub list + กระทู้รายตัว · public เห็นเฉพาะที่ไม่ hidden

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const THREADS_PAGE_SIZE = 20;

const authorSelect = {
  select: { id: true, name: true, verified: true, image: true },
};

export type CommunityListParams = {
  category?: string;
  page?: number;
};

/** hub: กระทู้ไม่ hidden เรียง pinned ก่อน แล้ว lastReplyAt ล่าสุด */
export async function getThreads(params: CommunityListParams) {
  const { category, page = 1 } = params;
  const where: Prisma.ThreadWhereInput = {
    hidden: false,
    ...(category ? { category } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.thread.count({ where }),
    prisma.thread.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { lastReplyAt: "desc" }],
      skip: (page - 1) * THREADS_PAGE_SIZE,
      take: THREADS_PAGE_SIZE,
      include: {
        author: authorSelect,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / THREADS_PAGE_SIZE)),
  };
}

/** จำนวนกระทู้ต่อหมวด (ป้ายบนแท็บ) */
export async function getThreadCategoryCounts() {
  const grouped = await prisma.thread.groupBy({
    by: ["category"],
    where: { hidden: false },
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.category] = g._count._all;
  return counts;
}

/** กระทู้รายตัว (ไม่ hidden) + รูป + ผู้เขียน */
export async function getThreadBySlug(slug: string) {
  return prisma.thread.findFirst({
    where: { slug, hidden: false },
    include: {
      author: authorSelect,
      images: { orderBy: { order: "asc" } },
    },
  });
}

/** คำตอบของกระทู้ (ไม่ hidden) เรียงเก่า→ใหม่ */
export async function getThreadReplies(threadId: string) {
  return prisma.threadReply.findMany({
    where: { threadId, hidden: false },
    orderBy: { createdAt: "asc" },
    include: { author: authorSelect },
  });
}

/** slug กระทู้ไม่ hidden ทั้งหมด (sitemap — C3) */
export async function getThreadsForSitemap() {
  return prisma.thread.findMany({
    where: { hidden: false },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

/** กระทู้ล่าสุดสำหรับหน้าแรก (C3) */
export async function getLatestThreads(limit = 3) {
  return prisma.thread.findMany({
    where: { hidden: false },
    orderBy: { lastReplyAt: "desc" },
    take: limit,
    include: { author: authorSelect },
  });
}

// ---------- C2: author edit + admin ----------

/** กระทู้ของ user สำหรับหน้าแก้ไข (ตรวจ ownership) */
export async function getMyThreadForEdit(id: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!thread || thread.authorId !== userId) return null;
  return thread;
}

/** คิวรายงานชุมชนสำหรับแอดมิน (ค้างก่อน) */
export async function getForumReportsForAdmin() {
  return prisma.forumReport.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      thread: { select: { id: true, slug: true, title: true, hidden: true } },
      reply: {
        select: {
          id: true,
          body: true,
          hidden: true,
          thread: { select: { slug: true, title: true } },
        },
      },
    },
  });
}

export async function getOpenForumReportCount() {
  return prisma.forumReport.count({ where: { resolved: false } });
}
