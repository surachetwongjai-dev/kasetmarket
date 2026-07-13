"use client";

// ปุ่มรายงานกระทู้/คำตอบ (C2) — ไม่ต้องล็อกอิน · dialog เลือกเหตุผล

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { reportForumAction } from "../actions";
import { FORUM_REPORT_REASONS } from "../schemas";

const initialState = {} as { success?: boolean; error?: string };

export function ForumReportButton({
  target,
  targetId,
  label = "รายงาน",
}: {
  target: "thread" | "reply";
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    reportForumAction,
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          🚩 {label}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            รายงาน{target === "thread" ? "กระทู้" : "คำตอบ"}นี้
          </DialogTitle>
        </DialogHeader>

        {state.success ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm">ขอบคุณสำหรับการรายงาน ทีมงานจะตรวจสอบโดยเร็ว</p>
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
            <input type="hidden" name="target" value={target} />
            <input type="hidden" name="targetId" value={targetId} />
            <div className="flex flex-col gap-2">
              {FORUM_REPORT_REASONS.map((reason) => (
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
