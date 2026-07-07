// Admin panel — โครงหน้า (เนื้อหาจริงมาใน M7: คิวอนุมัติ, จัดการ user, รายงาน, CMS)
// role-gated: middleware กัน non-ADMIN แล้ว + ตรวจซ้ำฝั่ง server

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";

export const metadata: Metadata = {
  title: "ผู้ดูแลระบบ",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        ผู้ดูแลระบบ
      </h1>
      <p className="mt-1 text-muted-foreground">
        เข้าสู่ระบบในฐานะ {session.user.name}
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        แผงควบคุมแอดมินจะมาใน M7 — คิวอนุมัติประกาศ จัดการผู้ใช้ รายงาน และ CMS
        บทความ
      </div>
    </main>
  );
}
