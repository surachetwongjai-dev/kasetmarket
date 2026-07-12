// คิวคำขอยืนยันตัวตน (T3) — PENDING เก่าสุดขึ้นก่อน + ข้อมูลผู้ขอเพื่อประกอบการตัดสินใจ

import type { Metadata } from "next";
import Link from "next/link";
import { getVerificationsForAdmin } from "@/features/trust";
import { VerifyAdminActions } from "@/features/trust";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "คำขอยืนยันตัวตน",
};

export default async function AdminVerificationsPage() {
  const requests = await getVerificationsForAdmin();

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        🎉 ไม่มีคำขอยืนยันตัวตนรอตรวจ
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        รอตรวจ {requests.length} คำขอ (เก่าสุดขึ้นก่อน) — ตรวจหลักฐานผ่าน LINE OA
        แล้วบันทึกวิธีที่ใช้ตรวจ
      </p>
      {requests.map((req) => (
        <article
          key={req.id}
          className="flex flex-col gap-3 rounded-xl border border-accent/50 bg-card p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 font-medium">
                <Link
                  href={`/sellers/${req.user.id}`}
                  target="_blank"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {req.user.name} ↗
                </Link>
                {req.user.verified && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    ✓ verified อยู่แล้ว
                  </span>
                )}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {req.user.province ? `${req.user.province} · ` : ""}
                สมาชิกตั้งแต่ {formatThaiDate(req.user.createdAt)} ·{" "}
                {req.user._count.listings} ประกาศ ·{" "}
                {req.user._count.reviewsReceived} รีวิว
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              ส่งเมื่อ {formatThaiDateTime(req.createdAt)}
            </span>
          </div>

          {req.note ? (
            <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
              {req.note}
            </p>
          ) : (
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              (ไม่ได้กรอกข้อความ)
            </p>
          )}

          <VerifyAdminActions requestId={req.id} />
        </article>
      ))}
    </div>
  );
}
