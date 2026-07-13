// Queries กระดานจับคู่ซื้อขาย (B1) — dashboard เจ้าของ + คิวแอดมิน (public queries มาใน B2)

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
