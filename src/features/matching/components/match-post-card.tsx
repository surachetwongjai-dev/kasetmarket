// การ์ดโพสบนกระดานจับคู่ (B2) — type badge สี, ชื่อ, ปริมาณ, จังหวัด, targetDate, ผู้โพส

import Link from "next/link";
import { matchTypeMeta } from "@/config/matchTypes";
import { getCategoryLabel } from "@/config/categories";
import { formatThaiDate } from "@/lib/format";
import { matchPostPath } from "../paths";

export type MatchPostCardData = {
  slug: string;
  type: "SUPPLY" | "DEMAND";
  title: string;
  category: string;
  province: string;
  district: string | null;
  quantity: string;
  targetDate: Date | null;
  user: { name: string; verified: boolean };
};

export function MatchPostCard({ post }: { post: MatchPostCardData }) {
  const meta = matchTypeMeta(post.type);
  const badgeClass =
    post.type === "SUPPLY"
      ? "bg-primary/10 text-primary"
      : "bg-accent/20 text-accent-foreground";

  return (
    <Link
      href={matchPostPath(post.slug)}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
        >
          {meta.icon} {meta.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {getCategoryLabel(post.category)}
        </span>
      </div>

      <h3 className="line-clamp-2 font-medium text-foreground">{post.title}</h3>

      <p className="font-num text-lg font-bold text-accent-foreground">
        {post.quantity}
      </p>

      <p className="text-xs text-muted-foreground">
        📍 {post.province}
        {post.district ? ` · ${post.district}` : ""}
        {post.targetDate
          ? ` · ${meta.dateLabel} ${formatThaiDate(post.targetDate)}`
          : ""}
      </p>

      <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        โดย {post.user.name}
        {post.user.verified && (
          <span className="text-primary" title="ยืนยันตัวตนแล้ว">
            ✓
          </span>
        )}
      </p>
    </Link>
  );
}
