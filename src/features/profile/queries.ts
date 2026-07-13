import { prisma } from "@/lib/prisma";

/** โปรไฟล์ฟาร์มของ user (พร้อมรูปเรียงลำดับ) — ใช้ prefill ฟอร์มแก้ไข + หน้า public (U2) */
export async function getFarmProfile(userId: string) {
  return prisma.farmProfile.findUnique({
    where: { userId },
    include: { images: { orderBy: { order: "asc" } } },
  });
}
