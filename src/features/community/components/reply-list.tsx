// รายการคำตอบในกระทู้ (C1) — เรียงเก่า→ใหม่ · server component

import { formatTimeAgo } from "@/lib/format";

export type ReplyView = {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; verified: boolean };
};

export function ReplyList({ replies }: { replies: ReplyView[] }) {
  if (replies.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
        ยังไม่มีคำตอบ — มาเป็นคนแรกที่ช่วยตอบสิ
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {replies.map((reply) => (
        <li
          key={reply.id}
          className="rounded-xl border border-border bg-card p-4"
        >
          <p className="flex items-center gap-1 text-sm font-medium">
            {reply.author.name}
            {reply.author.verified && (
              <span className="text-primary" title="ยืนยันตัวตนแล้ว">
                ✓
              </span>
            )}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              · {formatTimeAgo(reply.createdAt)}
            </span>
          </p>
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
            {reply.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
