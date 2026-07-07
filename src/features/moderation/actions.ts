"use server";

// Actions ฝั่งรายงานประกาศ (public — M6) และงานแอดมิน (M7)

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { rejectSchema, reportSchema } from "./schemas";

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

// ---------- แอดมินเท่านั้น (M7) ----------

/** ตรวจ role ADMIN — action ฝั่งแอดมินทุกตัวต้องเรียกก่อน */
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return session;
}

function revalidateAdminAndPublic(slug?: string) {
  revalidatePath("/admin", "layout"); // ทุกหน้าใต้ /admin
  revalidatePath("/listings");
  if (slug) revalidatePath(`/listings/${slug}`);
}

/** อนุมัติประกาศ PENDING → ACTIVE */
export async function approveListingAction(formData: FormData) {
  await requireAdmin();
  const listing = await prisma.listing.update({
    where: { id: String(formData.get("id")) },
    data: { status: "ACTIVE", rejectReason: null },
    select: { slug: true },
  });
  revalidateAdminAndPublic(listing.slug);
}

export type RejectFormState = { error?: string };

/** ปฏิเสธประกาศพร้อมเหตุผล (แสดงให้ผู้ขายเห็นใน dashboard) */
export async function rejectListingAction(
  _prev: RejectFormState,
  formData: FormData,
): Promise<RejectFormState> {
  await requireAdmin();
  const parsed = rejectSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const listing = await prisma.listing.update({
    where: { id: parsed.data.listingId },
    data: { status: "REJECTED", rejectReason: parsed.data.reason },
    select: { slug: true },
  });
  revalidateAdminAndPublic(listing.slug);
  return {};
}

/** ตั้ง/ถอดประกาศเด่น */
export async function toggleFeaturedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const listing = await prisma.listing.findUniqueOrThrow({
    where: { id },
    select: { featured: true, slug: true },
  });
  await prisma.listing.update({
    where: { id },
    data: { featured: !listing.featured },
  });
  revalidateAdminAndPublic(listing.slug);
}

/** ให้/ถอด badge ยืนยันตัวตน — verified แล้วประกาศใหม่ขึ้น ACTIVE ทันที */
export async function toggleVerifyUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { verified: true },
  });
  await prisma.user.update({ where: { id }, data: { verified: !user.verified } });
  revalidatePath("/admin", "layout");
}

/** แบน/ปลดแบน — แบนแล้วล็อกอินใหม่ไม่ได้ + ลงประกาศไม่ได้ */
export async function toggleBanUserAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  if (id === session.user.id) return; // กันแบนตัวเอง
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { banned: true, role: true },
  });
  if (user.role === "ADMIN") return; // กันแบนแอดมินด้วยกัน
  await prisma.user.update({ where: { id }, data: { banned: !user.banned } });
  revalidatePath("/admin", "layout");
}

/** ปิดงานรายงาน (ตรวจแล้ว) */
export async function resolveReportAction(formData: FormData) {
  await requireAdmin();
  await prisma.report.update({
    where: { id: String(formData.get("id")) },
    data: { resolved: true },
  });
  revalidatePath("/admin", "layout");
}

/** ปิดประกาศจากรายงานทันที (REJECTED + เหตุผล) แล้ว mark รายงานว่าจัดการแล้ว */
export async function closeListingFromReportAction(formData: FormData) {
  await requireAdmin();
  const reportId = String(formData.get("reportId"));
  const report = await prisma.report.findUniqueOrThrow({
    where: { id: reportId },
    select: { listingId: true, reason: true },
  });
  const [listing] = await prisma.$transaction([
    prisma.listing.update({
      where: { id: report.listingId },
      data: {
        status: "REJECTED",
        rejectReason: `ถูกปิดจากการรายงาน (${report.reason}) — ติดต่อแอดมินหากคิดว่าเป็นความผิดพลาด`,
      },
      select: { slug: true },
    }),
    prisma.report.update({ where: { id: reportId }, data: { resolved: true } }),
  ]);
  revalidateAdminAndPublic(listing.slug);
}
