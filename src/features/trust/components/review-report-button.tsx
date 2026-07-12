"use client";

// ปุ่มรายงานรีวิว + dialog เลือกเหตุผล (ไม่บังคับล็อกอิน)

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { reportReviewAction, type ReviewFormState } from "../actions";
import { REVIEW_REPORT_REASONS } from "../schemas";

const initial: ReviewFormState = {};

export function ReviewReportButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    reportReviewAction,
    initial,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          🚩 รายงานรีวิว
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>รายงานรีวิว</DialogTitle>
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
            <input type="hidden" name="reviewId" value={reviewId} />
            <div className="flex flex-col gap-2">
              {REVIEW_REPORT_REASONS.map((reason) => (
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
