// แบ่งหน้ากระดานจับคู่ (B2) — ลิงก์ธรรมดา เก็บ filter เดิม (type/category/province/sort)

import Link from "next/link";
import { matchBoardPath, type MatchBoardParams } from "../paths";

export function MatchBoardPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: MatchBoardParams;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) =>
    matchBoardPath({ ...params, page: target > 1 ? String(target) : undefined });

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
