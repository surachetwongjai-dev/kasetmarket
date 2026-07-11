// แบ่งหน้ารวมร้านค้า — ลิงก์ธรรมดา เก็บ filter เดิมใน query string (แพทเทิร์นเดียวกับ ListingPagination)

import Link from "next/link";
import { DIRECTORY_BASE } from "../paths";
import type { ShopSearchParams } from "./shop-filters";

export function ShopPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: ShopSearchParams;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "page") sp.set(key, value);
    }
    if (target > 1) sp.set("page", String(target));
    const qs = sp.toString();
    return qs ? `${DIRECTORY_BASE}?${qs}` : DIRECTORY_BASE;
  }

  const linkClass =
    "flex h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-card px-3 font-medium transition-colors hover:bg-muted";

  return (
    <nav aria-label="แบ่งหน้า" className="flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          ← ก่อนหน้า
        </Link>
      ) : (
        <span className={`${linkClass} pointer-events-none opacity-40`}>
          ← ก่อนหน้า
        </span>
      )}
      <span className="px-2 text-sm text-muted-foreground">
        หน้า {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          ถัดไป →
        </Link>
      ) : (
        <span className={`${linkClass} pointer-events-none opacity-40`}>
          ถัดไป →
        </span>
      )}
    </nav>
  );
}
