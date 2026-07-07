"use client";

// ปุ่ม "รายงานประกาศ" + dialog เลือกเหตุผล (ไม่บังคับล็อกอิน)

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitReportAction, type ReportFormState } from "../actions";
import { REPORT_REASONS } from "../schemas";

const initialState: ReportFormState = {};

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitReportAction,
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          🚩 รายงานประกาศนี้
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>รายงานประกาศ</DialogTitle>
        </DialogHeader>

        {state.success ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              ขอบคุณสำหรับการรายงาน ทีมงานจะตรวจสอบโดยเร็วที่สุด
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground"
            >
              ปิด
            </button>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="listingId" value={listingId} />
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex min-h-11 items-center gap-2.5 rounded-lg border border-border px-3 text-base has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    required
                    className="size-4 accent-primary"
                  />
                  {reason}
                </label>
              ))}
            </div>
            <textarea
              name="detail"
              rows={3}
              maxLength={1000}
              placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-lg bg-destructive font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              {pending ? "กำลังส่ง..." : "ส่งรายงาน"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
