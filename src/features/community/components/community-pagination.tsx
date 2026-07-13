// แบ่งหน้า hub ชุมชน (C1) — ลิงก์ธรรมดา เก็บ filter หมวดเดิม

import Link from "next/link";
import { communityBoardPath, type CommunityBoardParams } from "../paths";

export function CommunityPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: CommunityBoardParams;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) =>
    communityBoardPath({
      ...params,
      page: target > 1 ? String(target) : undefined,
    });

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
