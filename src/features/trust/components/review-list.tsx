// รายการรีวิว (server) — แต่ละใบ: ผู้รีวิว, ดาว, ความเห็น, คำตอบผู้ขาย, ปุ่มรายงาน
// isSeller = ผู้ชมคือเจ้าของโปรไฟล์ → แสดงฟอร์มตอบกลับ

import Image from "next/image";
import Link from "next/link";
import { formatThaiDate } from "@/lib/format";
import type { SellerReviewView } from "../queries";
import { RatingStars } from "./rating-stars";
import { ReviewReplyForm } from "./review-reply-form";
import { ReviewReportButton } from "./review-report-button";

export function ReviewList({
  reviews,
  isSeller,
}: {
  reviews: SellerReviewView[];
  isSeller: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
        ยังไม่มีรีวิว — เป็นคนแรกที่รีวิวผู้ขายรายนี้
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
              {r.reviewer.image ? (
                <Image
                  src={r.reviewer.image}
                  alt={r.reviewer.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-base">
                  👤
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {r.reviewer.name}
              </p>
              <RatingStars rating={r.rating} size="sm" />
            </div>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {formatThaiDate(r.createdAt)}
            </span>
          </div>

          {r.comment && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {r.comment}
            </p>
          )}

          {r.listing && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              เกี่ยวกับประกาศ:{" "}
              <Link
                href={`/listings/${r.listing.slug}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {r.listing.title}
              </Link>
            </p>
          )}

          <p className="mt-1.5 text-[11px] text-muted-foreground">
            รีวิวจากผู้ที่กดดูช่องทางติดต่อผ่านแพลตฟอร์ม
          </p>

          {r.sellerReply && (
            <div className="mt-2.5 rounded-lg bg-muted/50 p-2.5">
              <p className="text-xs font-medium text-primary-dk">
                ผู้ขายตอบกลับ
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
                {r.sellerReply}
              </p>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-3">
            {isSeller ? (
              <ReviewReplyForm reviewId={r.id} existingReply={r.sellerReply} />
            ) : (
              <span />
            )}
            <ReviewReportButton reviewId={r.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
