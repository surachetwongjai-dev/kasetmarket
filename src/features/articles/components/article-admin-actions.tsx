"use client";

// ปุ่มในตารางจัดการบทความ: เผยแพร่/เลิกเผยแพร่ + ลบ

import Link from "next/link";
import {
  deleteArticleAction,
  togglePublishArticleAction,
} from "../actions";

export function ArticleAdminActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const btn =
    "flex h-10 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/articles/${id}/edit`} className={btn}>
        แก้ไข
      </Link>
      <form action={togglePublishArticleAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className={
            published
              ? btn
              : `${btn} border-primary/40 text-primary hover:bg-primary/10`
          }
        >
          {published ? "เลิกเผยแพร่" : "เผยแพร่"}
        </button>
      </form>
      <form
        action={deleteArticleAction}
        onSubmit={(e) => {
          if (!confirm("ลบบทความนี้ถาวร?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="flex h-10 items-center rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          ลบ
        </button>
      </form>
    </div>
  );
}
