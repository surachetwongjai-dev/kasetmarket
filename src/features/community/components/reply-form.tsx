"use client";

// ฟอร์มตอบกระทู้ (C1) + ReplyGate ที่เช็ค session ฝั่ง client
// (หน้ากระทู้เป็น ISR — ต้องเช็คล็อกอินฝั่ง client เพื่อคงแคช)

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createReplyAction, type ReplyFormState } from "../actions";
import { MAX_REPLY_BODY } from "../schemas";

const initialState: ReplyFormState = {};

/** เลือกแสดงฟอร์มตอบ / คำเชิญล็อกอิน / ข้อความกระทู้ถูกล็อก ตามสถานะผู้ชม */
export function ReplyGate({
  threadId,
  locked,
}: {
  threadId: string;
  locked: boolean;
}) {
  const { status } = useSession();

  if (locked) {
    return (
      <p className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        🔒 กระทู้นี้ถูกล็อก ไม่สามารถตอบได้แล้ว
      </p>
    );
  }
  if (status === "loading") {
    return <div className="h-28 rounded-xl border border-border bg-card" />;
  }
  if (status !== "authenticated") {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center text-sm">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          เข้าสู่ระบบ
        </Link>{" "}
        เพื่อร่วมตอบกระทู้ (สมัครฟรีด้วย LINE)
      </div>
    );
  }
  return <ReplyForm threadId={threadId} />;
}

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createReplyAction,
    initialState,
  );

  // ตอบสำเร็จ → ล้างช่องพิมพ์ + refresh ดึงคำตอบใหม่ขึ้นมาแสดง (ไม่ redirect)
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="threadId" value={threadId} />
      <textarea
        name="body"
        required
        rows={4}
        maxLength={MAX_REPLY_BODY}
        placeholder="ร่วมตอบ/แชร์ประสบการณ์..."
        className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-base leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm font-medium text-primary">✅ ตอบกระทู้สำเร็จ</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 self-start rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "กำลังส่ง..." : "ตอบกระทู้"}
      </button>
    </form>
  );
}
