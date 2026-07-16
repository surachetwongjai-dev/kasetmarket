import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "TaladKaset ตลาดกลางซื้อขายสินค้าเกษตรออนไลน์ ให้เกษตรกรลงประกาศขายฟรี ผู้ซื้อติดต่อผู้ขายโดยตรง",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        เกี่ยวกับ TaladKaset
      </h1>
      <div className="article-prose mt-4">
        <p>
          TaladKaset คือตลาดกลางซื้อขายสินค้าเกษตรออนไลน์
          ที่สร้างขึ้นเพื่อให้เกษตรกรและผู้ค้าสินค้าเกษตรทั่วประเทศ
          มีพื้นที่ลงประกาศขายผลผลิตของตัวเองได้ฟรี
          โดยผู้ซื้อสามารถติดต่อผู้ขายได้โดยตรงทางโทรศัพท์หรือ LINE
          ไม่มีคนกลาง ไม่มีค่าธรรมเนียม
        </p>
        <h2>เราเชื่อว่า</h2>
        <p>
          เกษตรกรควรได้ราคาที่เป็นธรรมจากการขายผลผลิตของตัวเอง
          และผู้ซื้อควรเข้าถึงสินค้าเกษตรคุณภาพจากแหล่งผลิตโดยตรง
          เราจึงสร้างเครื่องมือที่ใช้ง่ายบนมือถือ
          พร้อมคลังบทความความรู้การเกษตรเพื่อเป็นประโยชน์ต่อชุมชนเกษตรกรไทย
        </p>
        <h2>ติดต่อเรา</h2>
        <p>
          หากมีข้อสงสัยหรือต้องการแจ้งปัญหา
          สามารถติดต่อทีมงานได้ผ่านช่องทางที่ประกาศไว้บนเว็บไซต์
        </p>
      </div>
      <div className="mt-6">
        <Link
          href="/listings"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          เริ่มดูประกาศขายสินค้าเกษตร →
        </Link>
      </div>
    </main>
  );
}
