// คิวอนุมัติ (M7 + B1) — ประกาศขาย + โพสกระดานจับคู่ (หลัง FLAGS.MATCHING) เก่าสุดขึ้นก่อน

import type { Metadata } from "next";
import Image from "next/image";
import { getPendingListings } from "@/features/moderation/queries";
import { ModerationActions } from "@/features/moderation/components/moderation-actions";
import { PriceTag } from "@/features/listings/components/price-tag";
import {
  getPendingMatchPosts,
  MatchPostModerationActions,
} from "@/features/matching";
import { matchTypeMeta } from "@/config/matchTypes";
import { FLAGS } from "@/config/flags";
import { getCategoryLabel } from "@/config/categories";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "คิวอนุมัติ",
};

export default async function ModerationPage() {
  const [pending, pendingMatch] = await Promise.all([
    getPendingListings(),
    FLAGS.MATCHING ? getPendingMatchPosts() : Promise.resolve([]),
  ]);

  if (pending.length === 0 && pendingMatch.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        🎉 ไม่มีรายการรออนุมัติ — เคลียร์หมดแล้ว
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {pending.length > 0 && (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            ประกาศขายรออนุมัติ {pending.length} รายการ (เก่าสุดขึ้นก่อน)
          </p>
          {pending.map((listing) => (
            <article
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-medium">{listing.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {getCategoryLabel(listing.category)} · {listing.province}
                    {listing.district ? ` · ${listing.district}` : ""} · ส่งเมื่อ{" "}
                    {formatThaiDateTime(listing.createdAt)}
                  </p>
                </div>
                <PriceTag
                  price={Number(listing.price)}
                  unit={listing.unit}
                  negotiable={listing.negotiable}
                />
              </div>

              {listing.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}

              <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                {listing.description}
              </p>

              <p className="text-xs text-muted-foreground">
                ผู้ขาย: <span className="font-medium">{listing.seller.name}</span>
                {listing.seller.verified && " ✓ยืนยันแล้ว"}
                {listing.seller.banned && " ⛔โดนแบน"} · ติดต่อ:{" "}
                {[listing.contactPhone, listing.contactLine]
                  .filter(Boolean)
                  .join(" / ") || "—"}
              </p>

              <ModerationActions listingId={listing.id} />
            </article>
          ))}
        </section>
      )}

      {pendingMatch.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            กระดานจับคู่ซื้อขายรออนุมัติ ({pendingMatch.length})
          </h2>
          {pendingMatch.map((post) => {
            const meta = matchTypeMeta(post.type);
            return (
              <article
                key={post.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {meta.icon} {meta.label}
                  </span>
                  <h3 className="mt-1 font-medium">{post.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {getCategoryLabel(post.category)} · {post.province}
                    {post.district ? ` · ${post.district}` : ""} · {post.quantity}
                    {post.targetDate
                      ? ` · ${meta.dateLabel} ${formatThaiDate(post.targetDate)}`
                      : ""}{" "}
                    · ส่งเมื่อ {formatThaiDateTime(post.createdAt)}
                  </p>
                </div>

                <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                  {post.detail}
                </p>

                <p className="text-xs text-muted-foreground">
                  ผู้โพส: <span className="font-medium">{post.user.name}</span>
                  {post.user.verified && " ✓ยืนยันแล้ว"}
                  {post.user.banned && " ⛔โดนแบน"} ·{" "}
                  {post.priceNote ? `ราคา: ${post.priceNote} · ` : ""}ติดต่อ:{" "}
                  {[post.contactPhone, post.contactLine].filter(Boolean).join(" / ") ||
                    "—"}
                </p>

                <MatchPostModerationActions matchPostId={post.id} />
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
