import type { Metadata } from "next";
import Link from "next/link";
import { SafetyNotice } from "@/features/trust/components/safety-notice";

export const metadata: Metadata = {
  title: "วิธีซื้อขายสินค้าเกษตรอย่างปลอดภัย",
  description:
    "คู่มือซื้อขายสินค้าเกษตรออนไลน์อย่างปลอดภัยบน TaladKaset — นัดดูสินค้าก่อนโอน เช็ครีวิว/badge ผู้ขาย รู้ทันสัญญาณมิจฉาชีพ และช่องทางแจ้งความเมื่อโดนโกง",
  alternates: { canonical: "/safety" },
};

// 10 ข้อควรทำ — เรียงตามจังหวะซื้อขายจริง
const TIPS: { title: string; detail: string }[] = [
  {
    title: "1. นัดดูสินค้าก่อนจ่ายเงินเสมอ",
    detail:
      "ถ้าเป็นไปได้ นัดเจอตัวจริงหรือขอวิดีโอคอลดูสินค้า/สวน/ฟาร์มก่อนตกลง อย่าตัดสินใจจากรูปในประกาศอย่างเดียว เพราะรูปคัดลอกกันได้",
  },
  {
    title: "2. อย่าโอนเงินมัดจำให้คนที่ยังไม่เคยเจอ",
    detail:
      "มิจฉาชีพมักเร่งให้โอนมัดจำ 'กันคิว' หรือ 'จองของ' ก่อน ถ้ายังไม่มั่นใจในตัวผู้ขาย อย่าโอน — ผู้ขายจริงที่ตั้งใจขายจะไม่กดดันคุณ",
  },
  {
    title: "3. เลือกจ่ายปลายทาง (COD) หรือชำระเมื่อรับของ",
    detail:
      "สำหรับสินค้าที่ส่งได้ ให้ใช้บริการเก็บเงินปลายทางของบริษัทขนส่ง จะปลอดภัยกว่าโอนล่วงหน้าเต็มจำนวน และตรวจสภาพของก่อนรับ",
  },
  {
    title: "4. เช็ครีวิวและป้ายยืนยันตัวตนของผู้ขาย",
    detail:
      "ดูดาวรีวิวและป้าย ✓ ยืนยันแล้ว บนโปรไฟล์ผู้ขาย ผู้ขายที่มีประวัติซื้อขายและถูกยืนยันตัวตนมีความน่าเชื่อถือกว่า (แต่ก็ยังต้องระวังทุกครั้ง)",
  },
  {
    title: "5. ตรวจสินค้าให้ครบก่อนจ่ายเงินก้อนสุดท้าย",
    detail:
      "ชั่งน้ำหนัก นับจำนวน ดูคุณภาพ/ความชื้น/ขนาดให้ตรงกับที่ตกลง โดยเฉพาะการซื้อจำนวนมาก (ตัน/คันรถ) ควรมีคนไปตรวจรับหน้างาน",
  },
  {
    title: "6. ตกลงราคา ค่าขนส่ง และเงื่อนไขให้ชัดเป็นลายลักษณ์อักษร",
    detail:
      "พิมพ์คุยใน LINE/แชตให้ครบว่า ราคาต่อหน่วยเท่าไร รวมค่าส่งไหม ใครออกค่าขนส่ง ส่งวันไหน เก็บข้อความไว้เป็นหลักฐาน",
  },
  {
    title: "7. ระวังราคาที่ถูกผิดปกติ",
    detail:
      "ถ้าราคาถูกกว่าตลาดมากจนไม่สมเหตุสมผล ให้สงสัยไว้ก่อน มิจฉาชีพมักใช้ราคาล่อใจเพื่อให้รีบโอน",
  },
  {
    title: "8. โอนเข้าบัญชีชื่อเดียวกับผู้ขายเท่านั้น",
    detail:
      "ถ้าจำเป็นต้องโอน ให้ชื่อบัญชีตรงกับชื่อผู้ขายที่คุยด้วย ระวังการอ้างให้โอนเข้าบัญชีบุคคลอื่น และเก็บสลิปไว้ทุกครั้ง",
  },
  {
    title: "9. เก็บหลักฐานการติดต่อและการโอนไว้เสมอ",
    detail:
      "บันทึกชื่อ-เบอร์-LINE ของผู้ขาย ลิงก์ประกาศ ข้อความที่คุย และสลิปโอน หากเกิดปัญหาจะใช้แจ้งความและติดตามได้",
  },
  {
    title: "10. เจอประกาศน่าสงสัย กดปุ่ม 'รายงาน'",
    detail:
      "ทุกประกาศมีปุ่มรายงาน ช่วยกันแจ้งเมื่อเจอประกาศหลอกลวง/สแปม ทีมงานจะตรวจสอบและปิดประกาศที่ผิดกฎ เพื่อให้ชุมชนปลอดภัยขึ้น",
  },
];

// สัญญาณเตือนมิจฉาชีพ
const RED_FLAGS = [
  "เร่งให้โอนมัดจำทันที อ้างว่ามีคนจองแล้วหลายคน",
  "ไม่ยอมวิดีโอคอลหรือให้ดูสินค้าจริง อ้างเหตุผลต่างๆ",
  "ขอให้โอนเข้าบัญชีที่ชื่อไม่ตรงกับผู้ขาย",
  "ราคาถูกเกินจริงมาก และกดดันให้รีบตัดสินใจ",
  "ขอข้อมูลส่วนตัว รหัส OTP หรือให้กดลิงก์แปลกๆ",
];

export default function SafetyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        วิธีซื้อขายสินค้าเกษตรอย่างปลอดภัย
      </h1>

      <div className="mt-4">
        <SafetyNotice variant="banner" />
      </div>

      <p className="mt-4 text-base leading-relaxed text-foreground">
        TaladKaset เป็น<strong>ตัวกลาง</strong>ที่ช่วยให้ผู้ซื้อและผู้ขายสินค้าเกษตรมาเจอกันเท่านั้น
        เราไม่ได้เป็นคู่สัญญาในการซื้อขาย ไม่ได้ถือเงิน และไม่ได้จัดส่งสินค้าแทนผู้ขาย
        การตกลงราคา ค่าขนส่ง และการชำระเงิน เป็นเรื่องระหว่างผู้ซื้อกับผู้ขายโดยตรง
        โปรดใช้ความระมัดระวังทุกครั้งตามคำแนะนำด้านล่าง
      </p>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-primary-dk">
          10 ข้อควรทำก่อนตกลงซื้อขาย
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {TIPS.map((tip) => (
            <li
              key={tip.title}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-heading font-semibold text-foreground">
                {tip.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {tip.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-primary-dk">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            ✓ ยืนยันตัวตน
          </span>
          ป้ายนี้หมายความว่าอะไร
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          ผู้ขายที่มีป้าย ✓ คือผู้ที่ทีมงานได้ติดต่อตรวจสอบตัวตนและกิจการเบื้องต้นแล้ว
          (เช่น วิดีโอคอลดูสวน/ฟาร์ม/หน้าร้านจริง) เพื่อให้คุณมั่นใจมากขึ้นว่ามีตัวตนจริง
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">แต่ป้าย ✓ ไม่ใช่การการันตี</strong>ว่าการซื้อขายทุกครั้งจะปลอดภัย
          หรือสินค้าจะตรงตามที่ตกลง TaladKaset เป็นเพียงตัวกลาง ไม่ได้เป็นคู่สัญญาในการซื้อขาย
          โปรดใช้ความระมัดระวังและทำตามคำแนะนำด้านบนกับผู้ขายทุกราย ไม่ว่าจะมีป้าย ✓ หรือไม่
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-danger">
          🚩 สัญญาณเตือนมิจฉาชีพ
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-foreground">
          {RED_FLAGS.map((flag) => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-muted/40 p-4">
        <h2 className="font-heading text-lg font-bold text-primary-dk">
          ถ้าโดนโกง แจ้งความได้ที่ไหน
        </h2>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-foreground">
          <li>
            • <strong>สายด่วนตำรวจไซเบอร์ 1441</strong> หรือแจ้งความออนไลน์ที่{" "}
            <a
              href="https://www.thaipoliceonline.go.th"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              thaipoliceonline.go.th
            </a>
          </li>
          <li>
            • <strong>สายด่วน สคบ. 1166</strong> (สำนักงานคณะกรรมการคุ้มครองผู้บริโภค)
            สำหรับปัญหาสินค้า/บริการ
          </li>
          <li>
            • ติดต่อธนาคารที่คุณโอนเงินทันทีเพื่อขออายัดบัญชีปลายทาง
            (ยิ่งเร็วยิ่งมีโอกาสระงับเงิน)
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          เตรียมหลักฐาน: สลิปโอน ชื่อ-เบอร์-บัญชีผู้ขาย ลิงก์ประกาศ
          และข้อความที่พูดคุย ไว้ให้พร้อม
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link
          href="/listings"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ดูประกาศขายสินค้าเกษตร →
        </Link>
        <Link
          href="/terms"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ข้อตกลงการใช้งาน →
        </Link>
      </div>
    </main>
  );
}
