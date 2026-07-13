// โพสกระดานจับคู่ของฉัน (B1) — จัดการครบวงจร · หลัง FLAGS.MATCHING

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { FLAGS } from "@/config/flags";
import {
  getMyMatchPosts,
  MatchPostRowActions,
  MatchPostStatusBadge,
} from "@/features/matching";
import { matchTypeMeta } from "@/config/matchTypes";
import { getCategoryLabel } from "@/config/categories";
import { formatThaiDate, formatTimeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "โพสจับคู่ซื้อขายของฉัน",
};

const NOTICES: Record<string, string> = {
  active: "โพสสำเร็จ! โพสของคุณแสดงบนกระดานแล้ว",
  pending:
    "โพสสำเร็จ! อยู่ระหว่างรอแอดมินตรวจสอบ (ปกติไม่เกิน 1 วัน) — ผ่านแล้วจะแสดงบนกระดานทันที",
};

export default async function MyMatchPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  if (!FLAGS.MATCHING) notFound();

  const session = await auth();
  if (!session) redirect("/login");

  const { created, updated } = await searchParams;
  const notice = created ? NOTICES[created] : updated ? "บันทึกการแก้ไขแล้ว" : null;

  const posts = await getMyMatchPosts(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary-dk">
          โพสจับคู่ซื้อขายของฉัน
        </h1>
        <Link
          href="/dashboard/matching/new"
          className="flex h-11 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + โพสใหม่
        </Link>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary-dk">
          {notice}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          ยังไม่มีโพส — กด &quot;โพสใหม่&quot; เพื่อประกาศเสนอขายหรือรับซื้อ
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {posts.map((post) => {
            const meta = matchTypeMeta(post.type);
            return (
              <li
                key={post.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {meta.icon} {meta.label}
                    </span>
                    <p className="mt-1 line-clamp-2 font-medium">{post.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getCategoryLabel(post.category)} · {post.province} ·{" "}
                      {post.quantity} · ลงเมื่อ {formatTimeAgo(post.createdAt)}
                      {post.targetDate
                        ? ` · ${meta.dateLabel} ${formatThaiDate(post.targetDate)}`
                        : ""}{" "}
                      · หมดอายุ {formatThaiDate(post.expiresAt)}
                    </p>
                  </div>
                  <MatchPostStatusBadge status={post.status} />
                </div>
                {post.status === "REJECTED" && post.rejectReason && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    เหตุผลที่ไม่ผ่าน: {post.rejectReason} — แก้ไขแล้วระบบจะส่งเข้าคิวตรวจใหม่
                  </p>
                )}
                <MatchPostRowActions id={post.id} status={post.status} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
