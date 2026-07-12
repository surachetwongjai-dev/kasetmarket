// ฟอร์มลงทะเบียนร้านค้า (D5) — URL สาธารณะ /ลงทะเบียนร้านค้า (rewrite ใน next.config.ts)
// ไม่บังคับล็อกอิน (ลด friction เจ้าของร้านสูงวัย §10) — กันสแปมด้วย honeypot + rate limit ใน action

import type { Metadata } from "next";
import { ShopForm } from "@/features/directory/components/shop-form";
import { submitShopAction } from "@/features/directory/actions";

export const metadata: Metadata = {
  title: "ลงทะเบียนร้านค้าเกษตร (ฟรี)",
  description:
    "ลงทะเบียนร้านค้า-ตัวแทนจำหน่ายสินค้าเกษตรกับ KasetMarket ฟรี ให้ลูกค้าในพื้นที่ค้นหาร้านของคุณเจอ พร้อมเบอร์โทรและแผนที่",
  alternates: { canonical: "/ลงทะเบียนร้านค้า" },
};

export default function RegisterShopPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-heading text-xl font-bold text-primary-dk sm:text-2xl">
        ลงทะเบียนร้านค้าเกษตร (ฟรี)
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        เพิ่มร้านของคุณเข้าทำเนียบร้านค้าเกษตร ให้ลูกค้าในพื้นที่ค้นหาเจอ
        ทั้งจากหน้าเว็บและจาก Google — กรอกเฉพาะช่องที่มี * ก็ส่งได้
        ทีมงานจะตรวจสอบข้อมูลก่อนขึ้นหน้าเว็บภายใน 1-2 วัน
      </p>

      <div className="mt-5">
        <ShopForm action={submitShopAction} mode="register" />
      </div>
    </main>
  );
}
