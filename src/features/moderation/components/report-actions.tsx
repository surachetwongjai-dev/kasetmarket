"use client";

// ปุ่มจัดการรายงาน: ตรวจแล้ว / ปิดประกาศทันที (confirm ก่อน)

import { closeListingFromReportAction, resolveReportAction } from "../actions";

export function ReportActions({
  reportId,
  listingActive,
}: {
  reportId: string;
  listingActive: boolean;
}) {
  return (
    <div className="flex gap-2">
      <form action={resolveReportAction}>
        <input type="hidden" name="id" value={reportId} />
        <button
          type="submit"
          className="flex h-10 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          ✓ ตรวจแล้ว ไม่มีปัญหา
        </button>
      </form>
      {listingActive && (
        <form
          action={closeListingFromReportAction}
          onSubmit={(e) => {
            if (!confirm("ปิดประกาศนี้ทันที? ผู้ขายจะเห็นเหตุผลใน dashboard"))
              e.preventDefault();
          }}
        >
          <input type="hidden" name="reportId" value={reportId} />
          <button
            type="submit"
            className="flex h-10 items-center rounded-lg bg-destructive px-3 text-sm font-semibold text-white transition-colors hover:bg-destructive/90"
          >
            ⛔ ปิดประกาศทันที
          </button>
        </form>
      )}
    </div>
  );
}
