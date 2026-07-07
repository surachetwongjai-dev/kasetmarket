// Queries ฝั่งแอดมิน (M7) — เรียกจากหน้า /admin/* เท่านั้น (role ตรวจที่ page + action)

import { prisma } from "@/lib/prisma";

/** เที่ยงคืนวันนี้เวลาไทย (UTC+7) */
function startOfBangkokDay(): Date {
  const bkk = new Date(Date.now() + 7 * 3600 * 1000);
  return new Date(
    Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate()) -
      7 * 3600 * 1000,
  );
}

export async function getAdminStats() {
  const today = startOfBangkokDay();
  const [pendingListings, listingsToday, usersToday, openReports] =
    await Promise.all([
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.listing.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.report.count({ where: { resolved: false } }),
    ]);
  return { pendingListings, listingsToday, usersToday, openReports };
}

export async function getPendingListings() {
  return prisma.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }, // เก่าสุดก่อน — อย่าให้ใครรอนาน
    include: {
      images: { orderBy: { order: "asc" } },
      seller: {
        select: { id: true, name: true, verified: true, banned: true, createdAt: true },
      },
    },
  });
}

export async function getUsersForAdmin(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      province: true,
      verified: true,
      banned: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });
}

export async function getReportsForAdmin() {
  return prisma.report.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      listing: {
        select: { id: true, title: true, slug: true, status: true },
      },
      reporter: { select: { name: true } },
    },
  });
}

/** ค้นหาประกาศทุกสถานะ (สำหรับตั้ง featured / ปิดประกาศ) */
export async function searchListingsForAdmin(search?: string) {
  return prisma.listing.findMany({
    where: search
      ? { title: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 30,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      featured: true,
      province: true,
      views: true,
      seller: { select: { name: true } },
    },
  });
}
