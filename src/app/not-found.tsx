// 404 ทั้งเว็บ

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl">🌾</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-primary-dk">
        ไม่พบหน้าที่คุณต้องการ
      </h1>
      <p className="mt-2 text-muted-foreground">
        หน้านี้อาจถูกลบ ย้าย หรือประกาศหมดอายุไปแล้ว
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          กลับหน้าแรก
        </Link>
        <Link
          href="/listings"
          className="flex h-11 items-center rounded-lg border border-border bg-card px-5 font-medium transition-colors hover:bg-muted"
        >
          ดูประกาศทั้งหมด
        </Link>
      </div>
    </main>
  );
}
