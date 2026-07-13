"use client";

// ปุ่มจัดการคำตอบ (C2) — รายงาน (ทุกคน) · เจ้าของ: แก้(inline)/ลบ · แอดมิน: ซ่อน/ลบ

import { useActionState, useState } from "react";
import { useSession } from "next-auth/react";
import { ForumReportButton } from "./forum-report-button";
import {
  updateReplyAction,
  deleteReplyAction,
  toggleHideReplyAction,
} from "../actions";
import { MAX_REPLY_BODY } from "../schemas";

const initialState = {} as { success?: boolean; error?: string };
const btn =
  "text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export function ReplyControls({
  reply,
}: {
  reply: { id: string; authorId: string; body: string };
}) {
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateReplyAction,
    initialState,
  );

  const isAuthor = session?.user?.id === reply.authorId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (editing) {
    return (
      <form action={formAction} className="mt-2 flex flex-col gap-2">
        <input type="hidden" name="replyId" value={reply.id} />
        <textarea
          name="body"
          required
          rows={3}
          maxLength={MAX_REPLY_BODY}
          defaultValue={reply.body}
          className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="h-9 rounded-lg border border-border px-4 text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <ForumReportButton target="reply" targetId={reply.id} />
      {isAuthor && (
        <button type="button" onClick={() => setEditing(true)} className={btn}>
          ✏️ แก้ไข
        </button>
      )}
      {(isAuthor || isAdmin) && (
        <form
          action={deleteReplyAction}
          onSubmit={(e) => {
            if (!confirm("ลบคำตอบนี้?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={reply.id} />
          <button type="submit" className={`${btn} hover:text-destructive`}>
            🗑 ลบ
          </button>
        </form>
      )}
      {isAdmin && (
        <form action={toggleHideReplyAction}>
          <input type="hidden" name="id" value={reply.id} />
          <button type="submit" className={btn}>
            🙈 ซ่อน
          </button>
        </form>
      )}
    </div>
  );
}
