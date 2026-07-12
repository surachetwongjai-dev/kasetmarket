"use client";

// ปุ่มจัดการรีวิวที่ถูกรายงาน (แอดมิน): ซ่อน/เลิกซ่อนรีวิว + ปิดงานรายงาน

import {
  toggleHideReviewAction,
  resolveReviewReportAction,
} from "../actions";

export function ReviewAdminActions({
  reviewId,
  reportId,
  hidden,
  resolved,
}: {
  reviewId: string;
  reportId: string;
  hidden: boolean;
  resolved: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={toggleHideReviewAction}>
        <input type="hidden" name="id" value={reviewId} />
        <button
          type="submit"
          className={`flex h-10 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
            hidden
              ? "border border-border bg-background hover:bg-muted"
              : "bg-destructive text-white hover:bg-destructive/90"
          }`}
        >
          {hidden ? "↩ เลิกซ่อนรีวิว" : "🙈 ซ่อนรีวิว"}
        </button>
      </form>
      {!resolved && (
        <form action={resolveReviewReportAction}>
          <input type="hidden" name="id" value={reportId} />
          <button
            type="submit"
            className="flex h-10 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            ✓ ตรวจแล้ว
          </button>
        </form>
      )}
    </div>
  );
}
