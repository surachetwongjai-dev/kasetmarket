"use client";

// ปุ่มอนุมัติ (บังคับกรอกวิธีตรวจ) / ปฏิเสธ (บังคับเหตุผล) ในคิวยืนยันตัวตน (T3)
// ใช้ <details> เพื่อให้ฟอร์มอยู่ใน HTML ตั้งแต่แรก (ทำงานได้แม้ไม่มี JS)

import { useActionState } from "react";
import {
  approveVerificationAction,
  rejectVerificationAction,
  type VerifyAdminState,
} from "../actions";

const initial: VerifyAdminState = {};
const summaryBase =
  "flex h-11 cursor-pointer list-none items-center justify-center rounded-lg text-base font-semibold transition-colors [&::-webkit-details-marker]:hidden";
const fieldCls =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function VerifyAdminActions({ requestId }: { requestId: string }) {
  const [approveState, approveAction, approving] = useActionState(
    approveVerificationAction,
    initial,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectVerificationAction,
    initial,
  );

  return (
    <div className="flex flex-col gap-2">
      <details>
        <summary
          className={`${summaryBase} bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          ✓ อนุมัติ
        </summary>
        <form action={approveAction} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="id" value={requestId} />
          <input
            type="text"
            name="method"
            required
            placeholder="วิธีที่ใช้ตรวจ เช่น วิดีโอคอล LINE เห็นสวนจริง (บันทึกภายใน)"
            className={fieldCls}
          />
          {approveState.error && (
            <p className="text-sm text-destructive">{approveState.error}</p>
          )}
          <button
            type="submit"
            disabled={approving}
            className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {approving ? "กำลังบันทึก..." : "ยืนยันอนุมัติ (ให้ badge ✓)"}
          </button>
        </form>
      </details>

      <details>
        <summary
          className={`${summaryBase} border border-destructive/40 text-destructive hover:bg-destructive/10`}
        >
          ✕ ปฏิเสธ
        </summary>
        <form action={rejectAction} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="id" value={requestId} />
          <textarea
            name="reason"
            rows={2}
            required
            placeholder="เหตุผล (ผู้ขอจะเห็นข้อความนี้ และส่งใหม่ได้)"
            className={fieldCls}
          />
          {rejectState.error && (
            <p className="text-sm text-destructive">{rejectState.error}</p>
          )}
          <button
            type="submit"
            disabled={rejecting}
            className="h-11 rounded-lg bg-destructive font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
          >
            {rejecting ? "กำลังส่ง..." : "ยืนยันปฏิเสธพร้อมเหตุผล"}
          </button>
        </form>
      </details>
    </div>
  );
}
