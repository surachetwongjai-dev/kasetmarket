"use client";

// ปุ่มจัดการกระทู้ (C2) — client (หน้ากระทู้เป็น ISR) · เจ้าของ: แก้/ลบ · แอดมิน: ซ่อน/ปักหมุด/ล็อก/ลบ

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  deleteThreadAction,
  toggleHideThreadAction,
  togglePinThreadAction,
  toggleLockThreadAction,
} from "../actions";
import { threadPath } from "../paths";

const btn =
  "rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted";

export function ThreadControls({
  thread,
}: {
  thread: {
    id: string;
    slug: string;
    authorId: string;
    pinned: boolean;
    locked: boolean;
    hidden: boolean;
  };
}) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === thread.authorId;
  const isAdmin = session?.user?.role === "ADMIN";
  if (!isAuthor && !isAdmin) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isAuthor && (
        <Link href={`${threadPath(thread.slug)}/edit`} className={btn}>
          ✏️ แก้ไข
        </Link>
      )}
      {(isAuthor || isAdmin) && (
        <form
          action={deleteThreadAction}
          onSubmit={(e) => {
            if (!confirm("ลบกระทู้นี้ถาวร? กู้คืนไม่ได้")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={thread.id} />
          <button type="submit" className={`${btn} text-destructive`}>
            🗑 ลบ
          </button>
        </form>
      )}
      {isAdmin && (
        <>
          <FormBtn action={togglePinThreadAction} id={thread.id}>
            {thread.pinned ? "📌 เลิกปักหมุด" : "📌 ปักหมุด"}
          </FormBtn>
          <FormBtn action={toggleLockThreadAction} id={thread.id}>
            {thread.locked ? "🔓 ปลดล็อก" : "🔒 ล็อก"}
          </FormBtn>
          <FormBtn action={toggleHideThreadAction} id={thread.id}>
            {thread.hidden ? "👁 เลิกซ่อน" : "🙈 ซ่อน"}
          </FormBtn>
        </>
      )}
    </div>
  );
}

function FormBtn({
  action,
  id,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={btn}>
        {children}
      </button>
    </form>
  );
}
