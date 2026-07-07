// Dashboard ผู้ขาย — โครงหน้า (เนื้อหาจริงมาใน M5: จัดการประกาศ + ยอดวิว)
// dynamic, no cache ตาม rendering strategy (CLAUDE.md §2)

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { logoutAction } from "@/features/auth/actions";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "แดชบอร์ดผู้ขาย — KasetMarket",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login"); // middleware กันแล้ว — ตรวจซ้ำฝั่ง server

  const { user } = session;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-dk">
            แดชบอร์ดผู้ขาย
          </h1>
          <p className="mt-1 text-muted-foreground">
            สวัสดี {user.name ?? "ผู้ขาย"}{" "}
            {user.role === "ADMIN" && <Badge variant="secondary">แอดมิน</Badge>}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="h-11 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/listings/new"
          className="flex min-h-24 flex-col justify-center rounded-xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="text-lg font-semibold">+ ลงประกาศใหม่</span>
          <span className="mt-1 text-sm opacity-90">
            ลงฟรี ไม่จำกัดหมวด สูงสุด 5 ประกาศ/วัน
          </span>
        </Link>
        <Link
          href="/dashboard/listings"
          className="flex min-h-24 flex-col justify-center rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
        >
          <span className="text-lg font-semibold">ประกาศของฉัน</span>
          <span className="mt-1 text-sm text-muted-foreground">
            แก้ไข ปิดการขาย ต่ออายุ และดูยอดวิว
          </span>
        </Link>
      </div>
    </main>
  );
}
