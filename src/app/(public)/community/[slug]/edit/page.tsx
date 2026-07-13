// แก้ไขกระทู้ของตัวเอง (C2) — ล็อกอิน + เจ้าของ · ภายใน 24 ชม. (action บังคับ) · หลัง FLAGS.COMMUNITY

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { FLAGS } from "@/config/flags";
import { prisma } from "@/lib/prisma";
import { ThreadForm, updateThreadAction } from "@/features/community";

export const metadata: Metadata = { title: "แก้ไขกระทู้" };

export default async function EditThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!FLAGS.COMMUNITY) notFound();

  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const thread = await prisma.thread.findFirst({
    where: { slug: decodeURIComponent(slug) },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!thread || thread.authorId !== session.user.id) notFound();

  const action = updateThreadAction.bind(null, thread.id);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        แก้ไขกระทู้
      </h1>
      <div className="mt-6">
        <ThreadForm
          action={action}
          submitLabel="บันทึกการแก้ไข"
          defaults={{
            title: thread.title,
            body: thread.body,
            category: thread.category,
            images: thread.images.map((img) => ({ key: img.url, url: img.url })),
          }}
        />
      </div>
    </main>
  );
}
