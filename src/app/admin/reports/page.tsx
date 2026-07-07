// จัดการรายงานประกาศ (M7) — ค้างตรวจขึ้นก่อน + ลิงก์ไปประกาศ

import type { Metadata } from "next";
import Link from "next/link";
import { getReportsForAdmin } from "@/features/moderation/queries";
import { ReportActions } from "@/features/moderation/components/report-actions";
import { ListingStatusBadge } from "@/features/listings/components/listing-status-badge";
import { formatThaiDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "รายงานประกาศ",
};

export default async function AdminReportsPage() {
  const reports = await getReportsForAdmin();

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        ยังไม่มีรายงานจากผู้ใช้
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
            <span className="text-xs text-muted-foreground">
              {formatThaiDateTime(report.createdAt)} · โดย{" "}
              {report.reporter?.name ?? "ผู้ใช้ไม่ล็อกอิน"}
            </span>
          </div>

          <p className="flex flex-wrap items-center gap-2 text-sm">
            ประกาศ:{" "}
            <Link
              href={`/listings/${report.listing.slug}`}
              target="_blank"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {report.listing.title} ↗
            </Link>
            <ListingStatusBadge status={report.listing.status} />
          </p>

          {report.detail && (
            <p className="rounded-lg bg-muted/50 p-2.5 text-sm">
              &ldquo;{report.detail}&rdquo;
            </p>
          )}

          {!report.resolved && (
            <ReportActions
              reportId={report.id}
              listingActive={report.listing.status === "ACTIVE"}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
