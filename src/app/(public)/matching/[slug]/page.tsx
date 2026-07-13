// หน้าโพสจับคู่รายตัว (B2) — ISR 300s + on-demand revalidate (actions) · หลัง FLAGS.MATCHING
// SafetyNotice + ContactButtons (คำเตือนก่อนเบอร์) + cross-link สองฝั่ง

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { matchTypeMeta } from "@/config/matchTypes";
import { getCategoryLabel } from "@/config/categories";
import {
  getActiveMatchPostBySlug,
  getRelatedMatchPosts,
  getListingsForMatch,
  MatchPostCard,
  MATCHING_BASE,
  matchBoardPath,
  matchPostPath,
} from "@/features/matching";
import { ContactButtons } from "@/features/listings/components/contact-buttons";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ViewTracker } from "@/features/listings/components/view-tracker";
import { SafetyNotice } from "@/features/trust/components/safety-notice";
import { formatThaiDate, formatTimeAgo } from "@/lib/format";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!FLAGS.MATCHING) return {};
  const { slug } = await params;
  const post = await getActiveMatchPostBySlug(decodeURIComponent(slug));
  if (!post) return { title: "ไม่พบรายการ" };
  const meta = matchTypeMeta(post.type);
  const title = `${meta.label}: ${post.title} ${post.province}`;
  return {
    title,
    description: post.detail.slice(0, 160),
    alternates: { canonical: matchPostPath(slug) },
    openGraph: { title, description: post.detail.slice(0, 160), type: "website" },
  };
}

export default async function MatchPostDetailPage({ params }: Props) {
  if (!FLAGS.MATCHING) notFound();

  const { slug } = await params;
  const post = await getActiveMatchPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  const meta = matchTypeMeta(post.type);
  const [related, crossListings] = await Promise.all([
    getRelatedMatchPosts(post),
    getListingsForMatch(post.category, post.province),
  ]);

  const oppositeMeta = matchTypeMeta(post.type === "SUPPLY" ? "DEMAND" : "SUPPLY");
  const badgeClass =
    post.type === "SUPPLY"
      ? "bg-primary/10 text-primary"
      : "bg-accent/20 text-accent-foreground";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <ViewTracker
        endpoint={`/api/matching/${post.id}/view`}
        dedupeKey={`match:${post.id}`}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href={MATCHING_BASE} className="hover:text-primary hover:underline">
          กระดานจับคู่ซื้อขาย
        </Link>
        {" › "}
        <Link
          href={matchBoardPath({ type: post.type, category: post.category })}
          className="hover:text-primary hover:underline"
        >
          {meta.boardLabel} · {getCategoryLabel(post.category)}
        </Link>
      </nav>

      <div className="mt-3 grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${badgeClass}`}
          >
            {meta.icon} {meta.label}
          </span>

          <h1 className="mt-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
            {post.title}
          </h1>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:max-w-md">
            <div>
              <dt className="text-muted-foreground">ปริมาณ</dt>
              <dd className="font-num text-lg font-bold text-accent-foreground">
                {post.quantity}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">พื้นที่</dt>
              <dd className="font-medium">
                {post.province}
                {post.district ? ` · ${post.district}` : ""}
              </dd>
            </div>
            {post.targetDate && (
              <div>
                <dt className="text-muted-foreground">{meta.dateLabel}</dt>
                <dd className="font-medium">{formatThaiDate(post.targetDate)}</dd>
              </div>
            )}
            {post.priceNote && (
              <div>
                <dt className="text-muted-foreground">ราคา</dt>
                <dd className="font-medium">{post.priceNote}</dd>
              </div>
            )}
          </dl>

          <p className="mt-3 text-sm text-muted-foreground">
            โพสเมื่อ {formatTimeAgo(post.createdAt)} ·{" "}
            {post.views.toLocaleString("th-TH")} ครั้ง
          </p>

          <section className="mt-5">
            <h2 className="font-heading text-lg font-semibold">รายละเอียด</h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
              {post.detail}
            </p>
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <Link
            href={`/sellers/${post.user.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <h2 className="text-sm font-medium text-muted-foreground">ผู้โพส</h2>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              {post.user.name}
              {post.user.verified && (
                <span
                  title="ยืนยันตัวตนแล้ว"
                  className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                >
                  ✓ ยืนยันแล้ว
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {post.user.province ? `${post.user.province} · ` : ""}
              สมาชิกตั้งแต่ {formatThaiDate(post.user.createdAt)}
            </p>
            <p className="mt-1.5 text-xs font-medium text-primary">
              ดูโปรไฟล์ผู้โพส →
            </p>
          </Link>

          <SafetyNotice variant="banner" />

          {/* ไม่ส่ง revealEndpoint — MatchPost ไม่มี Listing ให้ผูก log (แพทเทิร์นเดียวกับหน้าร้าน) */}
          <ContactButtons phone={post.contactPhone} line={post.contactLine} />
        </aside>
      </div>

      {/* cross-link ฝั่งตรงข้าม (SUPPLY↔DEMAND) หมวด+จังหวัดเดียวกัน */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            {oppositeMeta.icon} {oppositeMeta.boardLabel}ในหมวดนี้
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <MatchPostCard key={r.id} post={r} />
            ))}
          </div>
        </section>
      )}

      {/* cross-link ประกาศขายปกติหมวดเดียวกัน */}
      {crossListings.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            ประกาศขาย{getCategoryLabel(post.category)}ในพื้นที่นี้
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {crossListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
