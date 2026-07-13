// โพสกระดานจับคู่ซื้อขายใหม่ (B1) — หลัง FLAGS.MATCHING

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { prisma } from "@/lib/prisma";
import { FLAGS } from "@/config/flags";
import { MatchPostForm, createMatchPostAction } from "@/features/matching";

export const metadata: Metadata = {
  title: "โพสกระดานจับคู่ซื้อขาย",
};

export default async function NewMatchPostPage() {
  if (!FLAGS.MATCHING) notFound();

  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, province: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        โพสกระดานจับคู่ซื้อขาย
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ประกาศผลผลิตที่จะมี (ล่วงหน้าได้) หรือประกาศรับซื้อ — ผู้สนใจติดต่อคุณตรงทางโทร/LINE
      </p>
      <div className="mt-6">
        <MatchPostForm
          action={createMatchPostAction}
          submitLabel="โพสลงกระดาน"
          defaults={{
            contactPhone: user?.phone ?? "",
            province: user?.province ?? "",
          }}
        />
      </div>
    </main>
  );
}
