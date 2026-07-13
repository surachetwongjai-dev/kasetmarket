// กระทู้รายตัว (C1) — ISR 300s + on-demand revalidate เมื่อมีตอบ · หลัง FLAGS.COMMUNITY

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { getForumCategory } from "@/config/forumCategories";
import {
  getThreadBySlug,
  getThreadReplies,
  ReplyList,
  ReplyGate,
  COMMUNITY_BASE,
  communityBoardPath,
} from "@/features/community";
import { ListingGallery } from "@/features/listings/components/listing-gallery";
import { ViewTracker } from "@/features/listings/components/view-tracker";
import { formatThaiDateTime, formatTimeAgo } from "@/lib/format";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!FLAGS.COMMUNITY) return {};
  const { slug } = await params;
  const thread = await getThreadBySlug(decodeURIComponent(slug));
  if (!thread) return { title: "ไม่พบกระทู้" };
  return {
    title: thread.title,
    description: thread.body.slice(0, 160),
    alternates: { canonical: `${COMMUNITY_BASE}/${slug}` },
    openGraph: {
      title: thread.title,
      description: thread.body.slice(0, 160),
      type: "article",
    },
  };
}

export default async function ThreadPage({ params }: Props) {
  if (!FLAGS.COMMUNITY) notFound();

  const { slug } = await params;
  const thread = await getThreadBySlug(decodeURIComponent(slug));
  if (!thread) notFound();

  const replies = await getThreadReplies(thread.id);
  const cat = getForumCategory(thread.category);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <ViewTracker
        endpoint={`/api/community/${thread.id}/view`}
        dedupeKey={`thread:${thread.id}`}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href={COMMUNITY_BASE} className="hover:text-primary hover:underline">
          ชุมชน
        </Link>
        {" › "}
        <Link
          href={communityBoardPath({ category: thread.category })}
          className="hover:text-primary hover:underline"
        >
          {cat?.icon} {cat?.label ?? thread.category}
        </Link>
      </nav>

      <article className="mt-3">
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          {thread.title}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link
            href={`/sellers/${thread.author.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {thread.author.name}
          </Link>
          {thread.author.verified && (
            <span className="text-primary" title="ยืนยันตัวตนแล้ว">
              ✓
            </span>
          )}
          · {formatTimeAgo(thread.createdAt)} · {thread.views.toLocaleString("th-TH")} เข้าชม
        </p>

        <div className="mt-4 whitespace-pre-wrap text-base leading-relaxed">
          {thread.body}
        </div>

        {thread.images.length > 0 && (
          <div className="mt-4 max-w-xl">
            <ListingGallery images={thread.images} title={thread.title} />
          </div>
        )}
      </article>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-primary-dk">
          {thread.repliesCount.toLocaleString("th-TH")} คำตอบ
        </h2>
        <div className="mt-3">
          <ReplyList replies={replies} />
        </div>
      </section>

      <section className="mt-6">
        <ReplyGate threadId={thread.id} locked={thread.locked} />
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        ตั้งกระทู้เมื่อ {formatThaiDateTime(thread.createdAt)}
      </p>
    </main>
  );
}
