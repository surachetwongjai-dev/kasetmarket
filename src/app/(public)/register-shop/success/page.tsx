// หน้ายืนยันส่งข้อมูลร้านสำเร็จ (D5) — URL สาธารณะ /ลงทะเบียนร้านค้า/สำเร็จ

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ส่งข้อมูลร้านสำเร็จ",
  robots: { index: false }, // หน้า transactional ไม่ต้อง index
};

export default function RegisterShopSuccessPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <p className="text-5xl" aria-hidden>
        ✅
      </p>
      <h1 className="mt-4 font-heading text-xl font-bold text-primary-dk sm:text-2xl">
        ส่งข้อมูลร้านสำเร็จ — รอตรวจสอบ 1-2 วัน
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        ทีมงานจะตรวจสอบข้อมูลร้านของคุณก่อนเผยแพร่
        เมื่อผ่านการตรวจสอบ ร้านจะแสดงในทำเนียบร้านค้าเกษตรโดยอัตโนมัติ
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/ร้านค้า"
          className="flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          ดูทำเนียบร้านค้า
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center rounded-lg border border-border px-5 font-medium transition-colors hover:bg-muted"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
