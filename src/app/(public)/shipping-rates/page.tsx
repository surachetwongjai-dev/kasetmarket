// หน้าเช็คค่าส่ง (S1) — เครื่องคิดฝั่ง client + ตาราง static + คู่มือ SEO
// URL สาธารณะ /เช็คค่าส่ง (rewrite → /shipping-rates) · หลัง FLAGS.SHIPPING_RATES
// หน้า static ล้วน (ไม่มี DB) — เรทดึงจาก config/shippingRates.ts

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShippingCalculator, SHIPPING_BASE } from "@/features/shipping";
import { SHIPPING_CARRIERS, SHIPPING_UPDATED_AT } from "@/config/shippingRates";
import { FLAGS } from "@/config/flags";

export const metadata: Metadata = {
  title: "เช็คค่าส่งพัสดุเกษตร ทุกค่าย — ไปรษณีย์ Flash J&T Kerry Nim",
  description:
    "คำนวณค่าส่งพัสดุสินค้าเกษตรทุกค่ายในที่เดียว กรอกน้ำหนัก+ขนาดกล่อง เทียบราคาถูกสุด พร้อมค่ายรับของสด/ผลไม้ และรถห้องเย็น",
  alternates: { canonical: SHIPPING_BASE },
};

export default function ShippingRatesPage() {
  if (!FLAGS.SHIPPING_RATES) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-heading text-2xl font-bold text-primary-dk sm:text-3xl">
        เช็คค่าส่งพัสดุเกษตร ทุกค่าย
      </h1>
      <p className="mt-2 text-muted-foreground">
        กรอกน้ำหนักและขนาดกล่อง เทียบค่าส่งทุกค่ายในที่เดียว
        พร้อมดูว่าค่ายไหนรับของสด/ผลไม้ และมีรถห้องเย็น
      </p>

      {/* Disclaimer เด่น */}
      <div className="mt-4 rounded-xl border border-accent-gold/40 bg-accent-gold/10 p-3 text-sm text-foreground">
        ⚠️ เรทมาตรฐานหน้าเคาน์เตอร์ อัปเดต {SHIPPING_UPDATED_AT} —
        เรทจริงอาจต่างตามโปรโมชั่น พื้นที่ปลายทาง และขนาดจริง
        โปรดกด “เช็คเรทจริง” ที่เว็บของแต่ละค่ายก่อนส่งเสมอ
      </div>

      <div className="mt-5">
        <ShippingCalculator />
      </div>

      {/* คู่มือ SEO: ส่งของสด/ผลไม้เลือกเจ้าไหน */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold text-primary-dk">
          ส่งผลไม้/ของสด เลือกเจ้าไหนดี?
        </h2>
        <div className="mt-3 flex flex-col gap-4 text-sm leading-relaxed text-foreground">
          <p>
            สินค้าเกษตรอย่างผลไม้ ผัก หรือของสด บอบช้ำและเสียง่ายกว่าพัสดุทั่วไป
            การเลือกผู้ให้บริการจึงไม่ควรดูแค่ราคาถูกที่สุด
            แต่ต้องดูว่าเจ้าไหนรับของสดและส่งถึงเร็วพอที่สินค้าจะยังสด
          </p>
          <div>
            <h3 className="font-semibold text-primary-dk">
              🍎 ผลไม้ตามฤดู (ทุเรียน มะม่วง ลำไย ส้ม)
            </h3>
            <p className="mt-1 text-muted-foreground">
              ไปรษณีย์ไทยมีบริการ <strong>“EMS ผลไม้”</strong>{" "}
              พร้อมกล่องผลไม้เฉพาะที่ออกแบบมาให้ทนแรงกดทับ เริ่มต้นราคาย่อมเยา
              ครอบคลุมถึงปลายทางที่ห่างไกล — เหมาะกับผู้ขายรายย่อยที่ส่งทีละกล่อง
              ส่วน Kerry และ Flash มักมีแคมเปญส่งผลไม้ตามฤดูกาลด้วย
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary-dk">
              ❄️ ของสดที่ต้องคุมอุณหภูมิ (ผักสลัด เนื้อสัตว์ อาหารทะเล)
            </h3>
            <p className="mt-1 text-muted-foreground">
              เลือกค่ายที่มี <strong>รถห้องเย็น</strong> อย่าง Nim Express
              (เด่นเส้นทางเหนือ–อีสาน ส่งข้ามจังหวัดได้ใน 1 วัน) หรือ Inter Express
              เพราะพัสดุเดินทางในตู้ควบคุมอุณหภูมิตลอดทาง
              ลดความเสี่ยงของเน่าเสียระหว่างทาง — เรทของบริการห้องเย็น
              คิดตามชนิดสินค้า แนะนำโทรเช็คสาขาก่อน
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary-dk">
              💰 พัสดุแห้ง/ทนได้ (เมล็ดพันธุ์ ปุ๋ย อุปกรณ์)
            </h3>
            <p className="mt-1 text-muted-foreground">
              ของที่ไม่เสียง่ายเน้นราคาถูกได้เต็มที่ — Flash, BEST และ J&T
              มักถูกที่สุดในน้ำหนักเท่ากัน ส่วนของหนักหลายกิโล
              ลองเทียบ “พัสดุลงทะเบียน” ของไปรษณีย์ไทยด้วย
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary-dk">
              📦 กล่องใหญ่แต่น้ำหนักเบา
            </h3>
            <p className="mt-1 text-muted-foreground">
              ค่ายเอกชนส่วนใหญ่คิด <strong>น้ำหนักตามปริมาตร</strong> (กว้าง×ยาว×สูง
              เป็นเซนติเมตร หารด้วย 5000) แล้วเทียบกับน้ำหนักจริง ใช้ค่าที่มากกว่า
              ดังนั้นถ้ากล่องโป่งแต่เบา ลองกดปุ่ม “ระบุขนาดกล่อง” ด้านบน
              เพื่อดูราคาที่ใกล้ความจริงมากขึ้น
            </p>
          </div>
        </div>
      </section>

      {/* รายการค่าย + ลิงก์ทางการ */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold text-primary-dk">
          ค่ายขนส่งที่รวมไว้
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
          {SHIPPING_CARRIERS.map((c) => (
            <li
              key={c.slug}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{c.name}</p>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  {c.freshSupport && <span>🍎 รับของสด/ผลไม้</span>}
                  {c.coldChain && <span>❄️ ห้องเย็น</span>}
                  {c.codSupport && <span>COD ✓</span>}
                  {c.phone && <span>โทร {c.phone}</span>}
                </div>
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                เว็บทางการ →
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          หมายเหตุ: เว็บนี้ไม่ได้รับค่าคอมมิชชั่นจากการส่งของคุณ
          และไม่ได้เป็นตัวแทนของค่ายใด — เป็นเครื่องมือเทียบราคาเพื่อความสะดวกเท่านั้น
        </p>
      </section>
    </main>
  );
}
