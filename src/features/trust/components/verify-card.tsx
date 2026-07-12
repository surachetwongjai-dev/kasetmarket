"use client";

// การ์ด "ยืนยันตัวตน" บน dashboard ผู้ขาย (T3)
// ⚠️ ไม่มีช่องอัปโหลดไฟล์ — ตรวจหลักฐานนอกระบบผ่าน LINE OA (PDPA)

import { useActionState } from "react";
import { submitVerificationAction, type ReviewFormState } from "../actions";
import { MAX_VERIFY_NOTE } from "../schemas";
import { formatThaiDate } from "@/lib/format";

const initial: ReviewFormState = {};

type Request = {
  status: string;
  note: string | null;
  rejectReason: string | null;
  createdAt: Date;
} | null;

const BENEFITS = (
  <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
    <li>• ได้ badge ✓ ยืนยันตัวตน เพิ่มความน่าเชื่อถือต่อผู้ซื้อ</li>
    <li>• ประกาศใหม่ขึ้นทันที ไม่ต้องรอคิวอนุมัติ</li>
  </ul>
);

export function VerifyCard({
  verified,
  request,
}: {
  verified: boolean;
  request: Request;
}) {
  const [state, formAction, pending] = useActionState(
    submitVerificationAction,
    initial,
  );

  if (verified) {
    return (
      <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <h2 className="flex items-center gap-2 font-heading font-semibold text-primary-dk">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            ✓ ยืนยันตัวตนแล้ว
          </span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          บัญชีของคุณได้รับการยืนยันตัวตนแล้ว — badge ✓ แสดงบนโปรไฟล์และประกาศ
          และประกาศใหม่ของคุณจะขึ้นทันทีไม่ต้องรอคิว
        </p>
      </section>
    );
  }

  if (request?.status === "PENDING") {
    return (
      <section className="rounded-xl border border-accent-gold/40 bg-accent-gold/10 p-4">
        <h2 className="font-heading font-semibold text-foreground">
          ⏳ คำขอยืนยันตัวตน — รอทีมงานตรวจสอบ
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          ทีมงานจะติดต่อคุณทาง <strong>LINE OA</strong> ภายใน 2 วันทำการ
          กรุณาเตรียมหลักฐาน เช่น รูปสวน/ฟาร์ม/หน้าร้าน หรือพร้อมวิดีโอคอลให้ดูสถานที่จริง
        </p>
        {request.note && (
          <p className="mt-2 rounded-lg bg-card/60 p-2.5 text-sm text-muted-foreground">
            ข้อความที่คุณส่ง: {request.note}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          ส่งคำขอเมื่อ {formatThaiDate(request.createdAt)}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-heading font-semibold text-foreground">
        ยืนยันตัวตนผู้ขาย
      </h2>
      {BENEFITS}

      {request?.status === "REJECTED" && request.rejectReason && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-sm">
          <p className="font-medium text-destructive">
            คำขอก่อนหน้าไม่ผ่าน
          </p>
          <p className="mt-0.5 text-muted-foreground">
            เหตุผล: {request.rejectReason}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            แก้ไขแล้วส่งคำขอใหม่ได้เลย
          </p>
        </div>
      )}

      <form action={formAction} className="mt-3 flex flex-col gap-2">
        <label className="text-sm text-muted-foreground">
          เล่าสั้นๆ ว่าคุณขายอะไร มีสวน/ฟาร์ม/ร้านที่ไหน มีหลักฐานอะไรบ้าง
          (ไม่บังคับ)
        </label>
        <textarea
          name="note"
          rows={3}
          maxLength={MAX_VERIFY_NOTE}
          placeholder="เช่น ขายทุเรียนหมอนทองจากสวนตัวเองที่จันทบุรี 10 ไร่ พร้อมวิดีโอคอลให้ดูสวน"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <p className="text-xs text-muted-foreground">
          🔒 เพื่อความปลอดภัยของข้อมูลส่วนบุคคล ระบบ<strong>ไม่รับอัปโหลดไฟล์บัตรประชาชนหรือเอกสารใดๆ</strong>{" "}
          — ทีมงานจะตรวจหลักฐานผ่าน LINE OA
        </p>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && (
          <p className="text-sm font-medium text-primary">
            ส่งคำขอแล้ว ทีมงานจะติดต่อทาง LINE OA เร็วๆ นี้
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "กำลังส่ง..." : "ส่งคำขอยืนยันตัวตน"}
        </button>
      </form>
    </section>
  );
}
