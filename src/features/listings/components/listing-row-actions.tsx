"use client";

// ปุ่มจัดการประกาศในหน้า /dashboard/listings
// ใช้ client component เพื่อ confirm ก่อนลบ/ปิดการขาย

import Link from "next/link";
import type { ListingStatus } from "@prisma/client";
import {
  deleteListingAction,
  markSoldAction,
  renewListingAction,
} from "../actions";

export function ListingRowActions({
  id,
  status,
}: {
  id: string;
  status: ListingStatus;
}) {
  const btn =
    "flex h-10 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/listings/${id}/edit`} className={btn}>
        แก้ไข
      </Link>

      {(status === "ACTIVE" || status === "PENDING") && (
        <form
          action={markSoldAction}
          onSubmit={(e) => {
            if (!confirm("ปิดการขายประกาศนี้ (ขายแล้ว)?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={btn}>
            ขายแล้ว
          </button>
        </form>
      )}

      <form action={renewListingAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={btn}>
          ต่ออายุ +30 วัน
        </button>
      </form>

      <form
        action={deleteListingAction}
        onSubmit={(e) => {
          if (!confirm("ลบประกาศนี้ถาวร? กู้คืนไม่ได้")) e.preventDefault();
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
