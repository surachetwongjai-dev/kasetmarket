// การ์ดกระทู้บน hub ชุมชน (C1) — หัวข้อ, หมวด, ผู้โพส+badge, ตอบ N, เวลาเคลื่อนไหวล่าสุด

import Link from "next/link";
import { getForumCategory } from "@/config/forumCategories";
import { formatTimeAgo } from "@/lib/format";
import { threadPath } from "../paths";

export type ThreadCardData = {
  slug: string;
  title: string;
  category: string;
  pinned: boolean;
  repliesCount: number;
  lastReplyAt: Date;
  author: { name: string; verified: boolean };
};

export function ThreadCard({ thread }: { thread: ThreadCardData }) {
  const cat = getForumCategory(thread.category);
  return (
    <Link
      href={threadPath(thread.slug)}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {thread.pinned && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              📌 ปักหมุด
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-dk">
            {cat?.icon} {cat?.label ?? thread.category}
          </span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-medium text-foreground">
          {thread.title}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            {thread.author.name}
            {thread.author.verified && (
              <span className="text-primary" title="ยืนยันตัวตนแล้ว">
                ✓
              </span>
            )}
          </span>
          · เคลื่อนไหว {formatTimeAgo(thread.lastReplyAt)}
        </p>
      </div>
      <div className="shrink-0 text-center">
        <p className="font-num text-lg font-bold text-primary">
          {thread.repliesCount.toLocaleString("th-TH")}
        </p>
        <p className="text-xs text-muted-foreground">ตอบ</p>
      </div>
    </Link>
  );
}
