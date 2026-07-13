// ตั้งกระทู้ใหม่ (C1) — ต้องล็อกอิน · หลัง FLAGS.COMMUNITY

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { FLAGS } from "@/config/flags";
import { ThreadForm, CommunityRules, createThreadAction } from "@/features/community";

export const metadata: Metadata = {
  title: "ตั้งกระทู้ใหม่",
};

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!FLAGS.COMMUNITY) notFound();

  const session = await auth();
  if (!session) redirect("/login");

  const { category } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        ตั้งกระทู้ใหม่
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ถามปัญหา แชร์ความรู้ หรือชวนคุยเรื่องเกษตร — สุภาพ ตรงประเด็น ช่วยกันตอบ
      </p>
      <div className="mt-6">
        <CommunityRules />
      </div>
      <div className="mt-6">
        <ThreadForm action={createThreadAction} defaultCategory={category} />
      </div>
    </main>
  );
}
