// ชุมชนพูดคุย — hub (C1) · Server Component dynamic (filter หมวดผ่าน searchParams)
// URL สาธารณะ /ชุมชน (rewrite → /community) · หลัง FLAGS.COMMUNITY

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { FORUM_CATEGORIES, getForumCategoryLabel } from "@/config/forumCategories";
import {
  getThreads,
  getThreadCategoryCounts,
  ThreadCard,
  CommunityPagination,
  CommunityRules,
  COMMUNITY_BASE,
  communityBoardPath,
} from "@/features/community";
import { auth } from "@/features/auth";

export const metadata: Metadata = {
  title: "ชุมชนเกษตรกร — ถาม-ตอบ แลกเปลี่ยนความรู้",
  description:
    "ชุมชนพูดคุยของเกษตรกรไทย ถาม-ตอบปัญหาการเกษตร โรคพืช ปุ๋ย ราคา เครื่องจักร แลกเปลี่ยนประสบการณ์จริง",
  alternates: { canonical: COMMUNITY_BASE },
};

export default async function CommunityHubPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  if (!FLAGS.COMMUNITY) notFound();

  const params = await searchParams;
  const category = params.category || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ items, total, totalPages }, counts, session] = await Promise.all([
    getThreads({ category, page }),
    getThreadCategoryCounts(),
    auth(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary-dk sm:text-2xl">
            ชุมชนเกษตรกร
            {category ? ` · ${getForumCategoryLabel(category)}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ถาม-ตอบ แลกเปลี่ยนความรู้ ประสบการณ์จริงจากเพื่อนเกษตรกร
          </p>
        </div>
        <Link
          href={session ? "/community/new" : "/login"}
          className="flex h-11 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + ตั้งกระทู้
        </Link>
      </div>

      {/* แท็บหมวด */}
      <div className="mt-4 flex flex-wrap gap-2">
        <CategoryChip
          href={communityBoardPath({})}
          label="ทั้งหมด"
          active={!category}
        />
        {FORUM_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.value}
            href={communityBoardPath({ category: c.value })}
            label={`${c.icon} ${c.label}`}
            count={counts[c.value]}
            active={category === c.value}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {total.toLocaleString("th-TH")} กระทู้
      </p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ยังไม่มีกระทู้ในหมวดนี้ —{" "}
          <Link
            href={session ? "/community/new" : "/login"}
            className="font-medium text-primary hover:underline"
          >
            ตั้งกระทู้แรกเลย
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <CommunityPagination
          page={page}
          totalPages={totalPages}
          params={{ category }}
        />
      </div>

      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          📋 กติกาชุมชน
        </summary>
        <div className="mt-2">
          <CommunityRules />
        </div>
      </details>
    </main>
  );
}

function CategoryChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {label}
      {count ? (
        <span
          className={`rounded-full px-1.5 text-xs ${
            active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
