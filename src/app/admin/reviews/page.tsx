// จัดการรีวิวที่ถูกรายงาน (T2) — ค้างตรวจขึ้นก่อน + ซ่อน/เลิกซ่อน + resolve

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { getReviewReportsForAdmin } from "@/features/trust";
import { RatingStars } from "@/features/trust";
import { ReviewAdminActions } from "@/features/trust";
import { formatThaiDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "รายงานรีวิว",
};

export default async function AdminReviewsPage() {
  if (!FLAGS.REVIEWS) notFound();

  const reports = await getReviewReportsForAdmin();

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        ยังไม่มีรายงานรีวิวจากผู้ใช้
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li
          key={report.id}
          className={`flex flex-col gap-2.5 rounded-xl border p-4 ${
            report.resolved
              ? "border-border bg-card opacity-60"
              : "border-accent/50 bg-card"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {report.reason}
            </span>
            {report.resolved && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                จัดการแล้ว
              </span>
            )}
            {report.review.hidden && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                ซ่อนอยู่
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              รายงานเมื่อ {formatThaiDateTime(report.createdAt)}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <RatingStars rating={report.review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                โดย{" "}
                <Link
                  href={`/sellers/${report.review.reviewer.id}`}
                  target="_blank"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {report.review.reviewer.name}
                </Link>{" "}
                → ผู้ขาย{" "}
                <Link
                  href={`/sellers/${report.review.seller.id}`}
                  target="_blank"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {report.review.seller.name} ↗
                </Link>
              </span>
            </div>
            {report.review.comment ? (
              <p className="mt-1.5 whitespace-pre-wrap text-sm">
                &ldquo;{report.review.comment}&rdquo;
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                (ให้ดาวอย่างเดียว ไม่มีข้อความ)
              </p>
            )}
            {report.review.sellerReply && (
              <p className="mt-1.5 rounded bg-card p-2 text-xs text-muted-foreground">
                ผู้ขายตอบ: {report.review.sellerReply}
              </p>
            )}
          </div>

          <ReviewAdminActions
            reviewId={report.review.id}
            reportId={report.id}
            hidden={report.review.hidden}
            resolved={report.resolved}
          />
        </li>
      ))}
    </ul>
  );
}
