"use server";

// Actions ฝั่งรายงานประกาศ (public — M6) และงานแอดมิน (M7 อยู่ไฟล์นี้เช่นกัน)

import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { reportSchema } from "./schemas";

export type ReportFormState = {
  success?: boolean;
  error?: string;
};

/** ส่งรายงานประกาศ — ไม่บังคับล็อกอิน (ลด friction) แต่เก็บ reporterId ถ้ามี */
export async function submitReportAction(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const parsed = reportSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason"),
    detail: formData.get("detail") || undefined,
  });
  if (!parsed.success) {
    return { error: "กรุณาเลือกเหตุผลการรายงาน" };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true },
  });
  if (!listing) return { error: "ไม่พบประกาศนี้" };

  const session = await auth();

  // กันรายงานซ้ำถี่ๆ จากประกาศเดียวกัน+คนเดียวกัน (แบบหยาบ)
  if (session) {
    const recent = await prisma.report.count({
      where: {
        listingId: listing.id,
        reporterId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
      },
    });
    if (recent > 0) {
      return { success: true }; // รายงานไปแล้ว — ตอบสำเร็จเงียบๆ
    }
  }

  await prisma.report.create({
    data: {
      listingId: listing.id,
      reporterId: session?.user.id ?? null,
      reason: parsed.data.reason,
      detail: parsed.data.detail ?? null,
    },
  });

  return { success: true };
}
