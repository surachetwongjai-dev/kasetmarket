"use client";

// ปุ่มฝั่งขวาของ header ที่ขึ้นกับสถานะล็อกอิน — อ่าน session ฝั่ง client (useSession)
// จงใจแยกเป็น client component เพื่อไม่ให้ header/หน้า public กลายเป็น dynamic (คง ISR)
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function HeaderAuth() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  // ระหว่างเช็ค session — โชว์ placeholder กันปุ่มกระพริบจาก "เข้าสู่ระบบ" → บัญชี
  if (status === "loading") {
    return (
      <div className="ml-auto flex items-center gap-2" aria-hidden>
        <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // ยังไม่ล็อกอิน — คงพฤติกรรมเดิม (ปุ่มชี้ /login)
  if (!session?.user) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" className="min-h-10 px-2 sm:px-4" asChild>
          <Link href="/login">เข้าสู่ระบบ</Link>
        </Button>
        <Button className="min-h-10" asChild>
          <Link href="/login">
            <span className="hidden sm:inline">+ </span>ลงประกาศฟรี
          </Link>
        </Button>
      </div>
    );
  }

  // ล็อกอินแล้ว — ปุ่มลงประกาศไปหน้าสร้างจริง + เมนูบัญชี
  const user = session.user;
  const isAdmin = user.role === "ADMIN";
  const displayName = user.name?.trim() || "บัญชีของฉัน";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="ml-auto flex items-center gap-2">
      <Button className="min-h-10" asChild>
        <Link href="/dashboard/listings/new">
          <span className="hidden sm:inline">+ </span>ลงประกาศฟรี
        </Link>
      </Button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex min-h-10 items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent sm:px-2"
        >
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-num text-sm font-semibold text-primary-foreground"
          >
            {initial}
          </span>
          <span className="hidden max-w-28 truncate text-sm font-medium text-foreground sm:inline">
            {displayName}
          </span>
        </button>

        {open && (
          <>
            {/* พื้นหลังโปร่งใส — คลิกที่ไหนก็ปิดเมนู */}
            <div
              className="fixed inset-0 z-40"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-md border bg-card py-1 shadow-lg"
            >
              <div className="border-b px-3 py-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "ผู้ดูแลระบบ" : "ผู้ขาย"}
                </p>
              </div>

              <MenuItem href="/dashboard" onSelect={() => setOpen(false)}>
                แดชบอร์ด
              </MenuItem>
              <MenuItem href="/dashboard/listings" onSelect={() => setOpen(false)}>
                ประกาศของฉัน
              </MenuItem>
              {isAdmin && (
                <MenuItem href="/admin" onSelect={() => setOpen(false)}>
                  ผู้ดูแลระบบ
                </MenuItem>
              )}

              <div className="my-1 border-t" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="block w-full px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-accent"
              >
                ออกจากระบบ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
    >
      {children}
    </Link>
  );
}
