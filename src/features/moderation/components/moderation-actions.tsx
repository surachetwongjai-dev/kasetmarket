"use client";

// ปุ่ม Approve / Reject (พร้อมเหตุผล) ในคิวอนุมัติ — mobile-first ปุ่มใหญ่

import { useActionState, useState } from "react";
import {
  approveListingAction,
  rejectListingAction,
  type RejectFormState,
} from "../actions";

const initialState: RejectFormState = {};

export function ModerationActions({ listingId }: { listingId: string }) {
  const [showReject, setShowReject] = useState(false);
  const [state, rejectAction, pending] = useActionState(
    rejectListingAction,
    initialState,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <form action={approveListingAction} className="flex-1">
          <input type="hidden" name="id" value={listingId} />
          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ✓ อนุมัติ
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowReject((s) => !s)}
          className="h-12 flex-1 rounded-lg border border-destructive/40 text-base font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          ✕ ปฏิเสธ
        </button>
      </div>

      {showReject && (
        <form action={rejectAction} className="flex flex-col gap-2">
          <input type="hidden" name="listingId" value={listingId} />
          <textarea
            name="reason"
            rows={2}
            required
            placeholder="เหตุผล (ผู้ขายจะเห็นข้อความนี้) เช่น รูปไม่ชัด กรุณาถ่ายใหม่"
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
            {pending ? "กำลังส่ง..." : "ยืนยันปฏิเสธพร้อมเหตุผล"}
          </button>
        </form>
      )}
    </div>
  );
}
