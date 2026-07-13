// กระดานจับคู่ซื้อขาย (B2) — 2 แท็บ (เสนอขาย/รับซื้อ) + filter · Server Component dynamic
// URL สาธารณะ /จับคู่ซื้อขาย (rewrite → /matching) · หลัง FLAGS.MATCHING

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { MATCH_TYPES } from "@/config/matchTypes";
import { getCategoryLabel } from "@/config/categories";
import {
  getPublicMatchPosts,
  getMatchTypeCounts,
  MatchPostCard,
  MatchBoardFilters,
  MatchBoardPagination,
  MATCHING_BASE,
  matchBoardPath,
  type MatchBoardParams,
} from "@/features/matching";

export const metadata: Metadata = {
  title: "กระดานจับคู่ซื้อขายสินค้าเกษตร",
  description:
    "กระดานจับคู่ผลผลิตเกษตรล่วงหน้า ↔ ประกาศรับซื้อ — เกษตรกรเสนอผลผลิต ผู้รับซื้อประกาศความต้องการ ติดต่อกันตรง",
  alternates: { canonical: MATCHING_BASE },
};

export default async function MatchingBoardPage({
  searchParams,
}: {
  searchParams: Promise<MatchBoardParams>;
}) {
  if (!FLAGS.MATCHING) notFound();

  const params = await searchParams;
  const type = params.type === "DEMAND" ? "DEMAND" : "SUPPLY";
  const category = params.category || undefined;
  const province = params.province || undefined;
  const sort = params.sort === "nearest" ? "nearest" : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ items, total, totalPages }, counts] = await Promise.all([
    getPublicMatchPosts({ type, category, province, sort, page }),
    getMatchTypeCounts(category, province),
  ]);

  // params ปัจจุบัน (ไว้ประกอบลิงก์แท็บ/แบ่งหน้า — ไม่รวม page)
  const baseParams: MatchBoardParams = {
    category,
    province,
    sort: sort === "nearest" ? "nearest" : undefined,
  };

  const headline = [
    "กระดานจับคู่ซื้อขาย",
    category ? `หมวด${getCategoryLabel(category)}` : null,
    province ? `จ.${province}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="font-heading text-xl font-bold text-primary-dk sm:text-2xl">
        {headline}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        เกษตรกรเสนอผลผลิต (ล่วงหน้าได้) ↔ ผู้รับซื้อประกาศรับซื้อ — ติดต่อกันตรง
      </p>

      {/* แท็บประเภท */}
      <div className="mt-4 flex gap-2">
        {MATCH_TYPES.map((t) => {
          const active = t.value === type;
          return (
            <Link
              key={t.value}
              href={matchBoardPath({ ...baseParams, type: t.value })}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.boardLabel}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[t.value].toLocaleString("th-TH")}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <MatchBoardFilters params={{ ...baseParams, type }} />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        พบ {total.toLocaleString("th-TH")} รายการ
      </p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ยังไม่มีรายการในหมวด/จังหวัดนี้ — ลองเปลี่ยน filter หรือดูอีกแท็บ
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <MatchPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <MatchBoardPagination
          page={page}
          totalPages={totalPages}
          params={{ ...baseParams, type }}
        />
      </div>
    </main>
  );
}
