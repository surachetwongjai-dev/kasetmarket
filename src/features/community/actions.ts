"use server";

// Server Actions ชุมชน (C1) — post-moderation (โพสขึ้นทันที) · ต้องล็อกอิน · user แบนโพสไม่ได้
// rate limit: 5 กระทู้ + 30 คำตอบ/วัน · ตอบแล้ว repliesCount+lastReplyAt อัปเดต (กระทู้เด้งขึ้นบน)

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { generateSlug } from "@/lib/slug";
import {
  threadSchema,
  threadFormDataToObject,
  replySchema,
  replyEditSchema,
  forumReportSchema,
  THREAD_DAILY_LIMIT,
  REPLY_DAILY_LIMIT,
  EDIT_WINDOW_HOURS,
} from "./schemas";
import { threadPath } from "./paths";

export type ThreadFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
export type ReplyFormState = { error?: string };

function startOfBangkokDay(): Date {
  const bkk = new Date(Date.now() + 7 * 3600 * 1000);
  return new Date(
    Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate()) -
      7 * 3600 * 1000,
  );
}

async function requireUnbanned() {
  const session = await auth();
  if (!session) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { banned: true },
  });
  return { userId: session.user.id, banned: user.banned };
}

/** ตั้งกระทู้ใหม่ */
export async function createThreadAction(
  _prev: ThreadFormState,
  formData: FormData,
): Promise<ThreadFormState> {
  const session = await auth();
  if (!session) redirect("/login");

  const parsed = threadSchema.safeParse(threadFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { banned: true },
  });
  if (user.banned) {
    return { error: "บัญชีของคุณถูกระงับการใช้งาน — ตั้งกระทู้ไม่ได้" };
  }

  const todayCount = await prisma.thread.count({
    where: { authorId: session.user.id, createdAt: { gte: startOfBangkokDay() } },
  });
  if (todayCount >= THREAD_DAILY_LIMIT) {
    return {
      error: `ตั้งกระทู้ได้สูงสุด ${THREAD_DAILY_LIMIT} กระทู้ต่อวัน — พรุ่งนี้ตั้งต่อได้`,
    };
  }

  const { images, ...fields } = parsed.data;
  let slug = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    slug = generateSlug(fields.title);
    try {
      await prisma.thread.create({
        data: {
          ...fields,
          slug,
          authorId: session.user.id,
          images: {
            create: images.map((img, i) => ({ url: img.url, order: i })),
          },
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

  revalidatePath("/community");
  redirect(encodeURI(threadPath(slug))); // Location header ต้องเป็น ASCII (CLAUDE.md D4)
}

/** ตอบกระทู้ */
export async function createReplyAction(
  _prev: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState> {
  const { userId, banned } = await requireUnbanned();
  if (banned) return { error: "บัญชีของคุณถูกระงับการใช้งาน — ตอบไม่ได้" };

  const parsed = replySchema.safeParse({
    threadId: formData.get("threadId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const thread = await prisma.thread.findUnique({
    where: { id: parsed.data.threadId },
    select: { id: true, slug: true, locked: true, hidden: true },
  });
  if (!thread || thread.hidden) return { error: "ไม่พบกระทู้นี้" };
  if (thread.locked) return { error: "กระทู้นี้ถูกล็อก ตอบไม่ได้แล้ว" };

  const todayCount = await prisma.threadReply.count({
    where: { authorId: userId, createdAt: { gte: startOfBangkokDay() } },
  });
  if (todayCount >= REPLY_DAILY_LIMIT) {
    return { error: `ตอบได้สูงสุด ${REPLY_DAILY_LIMIT} ครั้งต่อวัน — พรุ่งนี้ตอบต่อได้` };
  }

  // สร้างคำตอบ + เด้งกระทู้ขึ้นบน (repliesCount+lastReplyAt) ในทรานแซกชันเดียว
  await prisma.$transaction([
    prisma.threadReply.create({
      data: { threadId: thread.id, authorId: userId, body: parsed.data.body },
    }),
    prisma.thread.update({
      where: { id: thread.id },
      data: { repliesCount: { increment: 1 }, lastReplyAt: new Date() },
    }),
  ]);

  revalidatePath(`/community/${thread.slug}`);
  revalidatePath("/community");
  redirect(encodeURI(threadPath(thread.slug)));
}

// ---------- C2: รายงาน + แก้ไข/ลบเอง ----------

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return session;
}

function withinEditWindow(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() <= EDIT_WINDOW_HOURS * 3600 * 1000;
}

/** รายงานกระทู้/คำตอบ — ไม่ต้องล็อกอิน · กันซ้ำ (มีรายงานค้างของ target เดิม = เงียบ) */
export async function reportForumAction(
  _prev: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState & { success?: boolean }> {
  const parsed = forumReportSchema.safeParse({
    target: formData.get("target"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: "กรุณาเลือกเหตุผลการรายงาน" };

  const { target, targetId, reason } = parsed.data;
  const where =
    target === "thread" ? { threadId: targetId } : { replyId: targetId };

  // target มีจริงไหม
  const exists =
    target === "thread"
      ? await prisma.thread.count({ where: { id: targetId } })
      : await prisma.threadReply.count({ where: { id: targetId } });
  if (!exists) return { error: "ไม่พบเนื้อหานี้" };

  const pending = await prisma.forumReport.count({
    where: { ...where, resolved: false },
  });
  if (pending === 0) {
    await prisma.forumReport.create({ data: { ...where, reason } });
    revalidatePath("/admin", "layout");
  }
  return { success: true };
}

/** แก้ไขกระทู้ของตัวเอง (ภายใน 24 ชม.) */
export async function updateThreadAction(
  threadId: string,
  _prev: ThreadFormState,
  formData: FormData,
): Promise<ThreadFormState> {
  const session = await auth();
  if (!session) redirect("/login");

  const parsed = threadSchema.safeParse(threadFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { authorId: true, slug: true, createdAt: true, hidden: true },
  });
  if (!thread || thread.authorId !== session.user.id) {
    return { error: "ไม่พบกระทู้ หรือคุณไม่ใช่เจ้าของ" };
  }
  if (thread.hidden) return { error: "กระทู้นี้ถูกซ่อนโดยผู้ดูแล แก้ไขไม่ได้" };
  if (!withinEditWindow(thread.createdAt)) {
    return { error: `แก้ไขได้ภายใน ${EDIT_WINDOW_HOURS} ชม. หลังโพสเท่านั้น` };
  }

  const { images, ...fields } = parsed.data;
  await prisma.thread.update({
    where: { id: threadId },
    data: {
      ...fields,
      images: {
        deleteMany: {},
        create: images.map((img, i) => ({ url: img.url, order: i })),
      },
    },
  });

  revalidatePath(`/community/${thread.slug}`);
  revalidatePath("/community");
  redirect(encodeURI(threadPath(thread.slug)));
}

/** ลบกระทู้ของตัวเอง (หรือแอดมิน) */
export async function deleteThreadAction(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findUnique({
    where: { id },
    select: { authorId: true, slug: true },
  });
  if (!thread) return;
  if (thread.authorId !== session.user.id && session.user.role !== "ADMIN") return;

  await prisma.thread.delete({ where: { id } });
  revalidatePath("/community");
  revalidatePath("/admin", "layout");
  redirect("/community");
}

/** แก้ไขคำตอบของตัวเอง (ภายใน 24 ชม.) */
export async function updateReplyAction(
  _prev: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState & { success?: boolean }> {
  const session = await auth();
  if (!session) return { error: "ต้องเข้าสู่ระบบก่อน" };

  const parsed = replyEditSchema.safeParse({
    replyId: formData.get("replyId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const reply = await prisma.threadReply.findUnique({
    where: { id: parsed.data.replyId },
    select: { authorId: true, createdAt: true, thread: { select: { slug: true } } },
  });
  if (!reply || reply.authorId !== session.user.id) {
    return { error: "ไม่พบคำตอบ หรือคุณไม่ใช่เจ้าของ" };
  }
  if (!withinEditWindow(reply.createdAt)) {
    return { error: `แก้ไขได้ภายใน ${EDIT_WINDOW_HOURS} ชม. หลังตอบเท่านั้น` };
  }

  await prisma.threadReply.update({
    where: { id: parsed.data.replyId },
    data: { body: parsed.data.body },
  });
  revalidatePath(`/community/${reply.thread.slug}`);
  return { success: true };
}

/** ลบคำตอบของตัวเอง (หรือแอดมิน) — ปรับ repliesCount ถ้าคำตอบยังแสดงอยู่ */
export async function deleteReplyAction(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const id = String(formData.get("id"));
  const reply = await prisma.threadReply.findUnique({
    where: { id },
    select: {
      authorId: true,
      hidden: true,
      threadId: true,
      thread: { select: { slug: true } },
    },
  });
  if (!reply) return;
  if (reply.authorId !== session.user.id && session.user.role !== "ADMIN") return;

  await prisma.$transaction([
    prisma.threadReply.delete({ where: { id } }),
    ...(reply.hidden
      ? []
      : [
          prisma.thread.update({
            where: { id: reply.threadId },
            data: { repliesCount: { decrement: 1 } },
          }),
        ]),
  ]);
  revalidatePath(`/community/${reply.thread.slug}`);
  revalidatePath("/admin", "layout");
}

// ---------- C2: แอดมิน ----------

/** ซ่อน/เลิกซ่อนกระทู้ */
export async function toggleHideThreadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findUniqueOrThrow({
    where: { id },
    select: { hidden: true, slug: true },
  });
  await prisma.thread.update({
    where: { id },
    data: { hidden: !thread.hidden },
  });
  revalidatePath(`/community/${thread.slug}`);
  revalidatePath("/community");
  revalidatePath("/admin", "layout");
}

/** ซ่อน/เลิกซ่อนคำตอบ — ปรับ repliesCount ตามการมองเห็น */
export async function toggleHideReplyAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const reply = await prisma.threadReply.findUniqueOrThrow({
    where: { id },
    select: { hidden: true, threadId: true, thread: { select: { slug: true } } },
  });
  const nowHidden = !reply.hidden;
  await prisma.$transaction([
    prisma.threadReply.update({ where: { id }, data: { hidden: nowHidden } }),
    prisma.thread.update({
      where: { id: reply.threadId },
      data: { repliesCount: { [nowHidden ? "decrement" : "increment"]: 1 } },
    }),
  ]);
  revalidatePath(`/community/${reply.thread.slug}`);
  revalidatePath("/admin", "layout");
}

/** ปักหมุด/เลิกปักหมุด */
export async function togglePinThreadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findUniqueOrThrow({
    where: { id },
    select: { pinned: true, slug: true },
  });
  await prisma.thread.update({ where: { id }, data: { pinned: !thread.pinned } });
  revalidatePath(`/community/${thread.slug}`);
  revalidatePath("/community");
  revalidatePath("/admin", "layout");
}

/** ล็อก/ปลดล็อก (ปิดการตอบ) */
export async function toggleLockThreadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findUniqueOrThrow({
    where: { id },
    select: { locked: true, slug: true },
  });
  await prisma.thread.update({ where: { id }, data: { locked: !thread.locked } });
  revalidatePath(`/community/${thread.slug}`);
  revalidatePath("/admin", "layout");
}

/** ปิดงานรายงาน (ตรวจแล้ว) */
export async function resolveForumReportAction(formData: FormData) {
  await requireAdmin();
  await prisma.forumReport.update({
    where: { id: String(formData.get("id")) },
    data: { resolved: true },
  });
  revalidatePath("/admin", "layout");
}
