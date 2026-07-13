"use client";

// ปุ่มจัดการโพสในหน้า /dashboard/matching — confirm ก่อนลบ/จับคู่แล้ว

import Link from "next/link";
import type { MatchPostStatus } from "@prisma/client";
import {
  deleteMatchPostAction,
  markMatchedAction,
  renewMatchPostAction,
} from "../actions";

export function MatchPostRowActions({
  id,
  status,
}: {
  id: string;
  status: MatchPostStatus;
}) {
  const btn =
    "flex h-10 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/matching/${id}/edit`} className={btn}>
        แก้ไข
      </Link>

      {(status === "ACTIVE" || status === "PENDING") && (
        <form
          action={markMatchedAction}
          onSubmit={(e) => {
            if (!confirm("ทำเครื่องหมายว่าจับคู่แล้ว? โพสจะหายจากกระดาน")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={btn}>
            จับคู่แล้ว
          </button>
        </form>
      )}

      <form action={renewMatchPostAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={btn}>
          ต่ออายุ +30 วัน
        </button>
      </form>

      <form
        action={deleteMatchPostAction}
        onSubmit={(e) => {
          if (!confirm("ลบโพสนี้ถาวร? กู้คืนไม่ได้")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          ลบ
        </button>
      </form>
    </div>
  );
}
