"use client";

// ปุ่ม Verify / Ban ในหน้าจัดการผู้ใช้ — confirm ก่อนแบน

import { toggleBanUserAction, toggleVerifyUserAction } from "../actions";

export function UserActions({
  userId,
  verified,
  banned,
  isAdmin,
}: {
  userId: string;
  verified: boolean;
  banned: boolean;
  isAdmin: boolean;
}) {
  if (isAdmin) return null; // ไม่มี action กับแอดมินด้วยกัน

  const btn =
    "flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors";

  return (
    <div className="flex gap-2">
      <form action={toggleVerifyUserAction}>
        <input type="hidden" name="id" value={userId} />
        <button
          type="submit"
          className={`${btn} ${
            verified
              ? "border-border bg-background hover:bg-muted"
              : "border-primary/40 text-primary hover:bg-primary/10"
          }`}
        >
          {verified ? "ถอดยืนยัน" : "✓ ยืนยันตัวตน"}
        </button>
      </form>
      <form
        action={toggleBanUserAction}
        onSubmit={(e) => {
          const msg = banned
            ? "ปลดแบนผู้ใช้คนนี้?"
            : "แบนผู้ใช้คนนี้? เขาจะล็อกอิน/ลงประกาศไม่ได้";
          if (!confirm(msg)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={userId} />
        <button
          type="submit"
          className={`${btn} ${
            banned
              ? "border-border bg-background hover:bg-muted"
              : "border-destructive/40 text-destructive hover:bg-destructive/10"
          }`}
        >
          {banned ? "ปลดแบน" : "⛔ แบน"}
        </button>
      </form>
    </div>
  );
}
