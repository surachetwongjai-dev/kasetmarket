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
  THREAD_DAILY_LIMIT,
  REPLY_DAILY_LIMIT,
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
