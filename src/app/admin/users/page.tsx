// จัดการผู้ใช้ (M7): ค้นหา + verify + ban/unban

import type { Metadata } from "next";
import { getUsersForAdmin } from "@/features/moderation/queries";
import { UserActions } from "@/features/moderation/components/user-actions";
import { formatThaiDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "จัดการผู้ใช้",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getUsersForAdmin(q?.trim() || undefined);

  return (
    <div className="flex flex-col gap-4">
      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร"
          className="h-11 w-full max-w-sm rounded-lg border border-input bg-card px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          ค้นหา
        </button>
      </form>

      {users.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">ไม่พบผู้ใช้</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 font-medium">
                  {user.name}
                  {user.role === "ADMIN" && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      แอดมิน
                    </span>
                  )}
                  {user.verified && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      ✓ ยืนยันแล้ว
                    </span>
                  )}
                  {user.banned && (
                    <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                      ⛔ โดนแบน
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[user.email, user.phone, user.province]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                  {" · "}ประกาศ {user._count.listings} รายการ · สมัคร{" "}
                  {formatThaiDate(user.createdAt)}
                </p>
              </div>
              <UserActions
                userId={user.id}
                verified={user.verified}
                banned={user.banned}
                isAdmin={user.role === "ADMIN"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
