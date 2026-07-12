"use client";

// ฟอร์มเขียน/แก้รีวิว — ตัวเลือกดาว + ความเห็น (แสดงเมื่อผู้ชมมีสิทธิ์รีวิวเท่านั้น)

import { useActionState, useState } from "react";
import {
  submitReviewAction,
  deleteMyReviewAction,
  type ReviewFormState,
} from "../actions";
import { MAX_REVIEW_COMMENT } from "../schemas";

const initial: ReviewFormState = {};

export function ReviewForm({
  sellerId,
  suggestedListingId,
  existing,
}: {
  sellerId: string;
  suggestedListingId?: string | null;
  existing?: { id: string; rating: number; comment: string | null; hidden: boolean } | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitReviewAction,
    initial,
  );
  const [rating, setRating] = useState(existing?.rating ?? 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-heading font-semibold text-foreground">
        {existing ? "แก้ไขรีวิวของคุณ" : "ให้คะแนนผู้ขายรายนี้"}
      </h3>
      {existing?.hidden && (
        <p className="mt-1 text-xs text-destructive">
          รีวิวของคุณถูกซ่อนโดยผู้ดูแลระบบ
        </p>
      )}

      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="sellerId" value={sellerId} />
        {suggestedListingId && (
          <input type="hidden" name="listingId" value={suggestedListingId} />
        )}
        <input type="hidden" name="rating" value={rating} />

        <div className="flex gap-1" role="group" aria-label="ให้คะแนน 1 ถึง 5 ดาว">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} ดาว`}
              aria-pressed={rating === n}
              className={`text-3xl leading-none transition-colors ${
                n <= rating ? "text-accent-gold" : "text-muted-foreground/40 hover:text-accent-gold/60"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          name="comment"
          rows={3}
          maxLength={MAX_REVIEW_COMMENT}
          defaultValue={existing?.comment ?? ""}
          placeholder="เล่าประสบการณ์การซื้อขาย (ไม่บังคับ)"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && (
          <p className="text-sm font-medium text-primary">
            บันทึกรีวิวแล้ว ขอบคุณสำหรับรีวิว
          </p>
        )}

        <button
          type="submit"
          disabled={pending || rating === 0}
          className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก..." : existing ? "อัปเดตรีวิว" : "ส่งรีวิว"}
        </button>
      </form>

      {existing && (
        <form
          action={deleteMyReviewAction}
          onSubmit={(e) => {
            if (!confirm("ลบรีวิวของคุณ?")) e.preventDefault();
          }}
          className="mt-2"
        >
          <input type="hidden" name="id" value={existing.id} />
          <button
            type="submit"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            ลบรีวิวของฉัน
          </button>
        </form>
      )}
    </div>
  );
}
