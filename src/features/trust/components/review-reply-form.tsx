"use client";

// ผู้ขายตอบกลับรีวิว (แสดงเฉพาะเจ้าของโปรไฟล์) — ตอบได้ 1 ครั้ง แก้ได้

import { useActionState, useState } from "react";
import { replyToReviewAction, type ReviewFormState } from "../actions";
import { MAX_SELLER_REPLY } from "../schemas";

const initial: ReviewFormState = {};

export function ReviewReplyForm({
  reviewId,
  existingReply,
}: {
  reviewId: string;
  existingReply?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    replyToReviewAction,
    initial,
  );

  if (state.success) {
    return <p className="text-sm font-medium text-primary">บันทึกคำตอบแล้ว</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {existingReply ? "แก้ไขคำตอบ" : "ตอบกลับรีวิวนี้"}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="reply"
        rows={2}
        required
        maxLength={MAX_SELLER_REPLY}
        defaultValue={existingReply ?? ""}
        placeholder="ตอบกลับในฐานะผู้ขาย"
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก..." : "บันทึกคำตอบ"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-10 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
