// คำเตือน "เราเป็นแค่ตัวกลาง" — โผล่ตรงจุดตัดสินใจ ไม่ซ่อนใน /terms (PLAN-PHASE2 กลุ่ม T)
// ไม่มี hook/interactivity → ใช้ได้ทั้งใน Server Component (banner) และ Client Component (pre-reveal)

import Link from "next/link";

type Variant = "banner" | "pre-reveal";

export function SafetyNotice({ variant = "banner" }: { variant?: Variant }) {
  if (variant === "pre-reveal") {
    // ข้อความสั้น บังคับเห็นก่อนเบอร์โผล่ (แทรกใน ContactButtons)
    return (
      <p className="rounded-lg border border-accent-gold/40 bg-accent-gold/10 p-2.5 text-xs leading-relaxed text-foreground">
        ⚠️ <strong>TaladKaset เป็นตัวกลางเท่านั้น</strong> — ตกลงราคา/ค่าขนส่งกับผู้ขายเอง{" "}
        <strong>อย่าโอนเงินหรือมัดจำ</strong>จนกว่าจะเห็นสินค้าจริงหรือมั่นใจในตัวผู้ขาย
      </p>
    );
  }

  // การ์ดเหลืองทอง — วางบนหน้าที่มีการติดต่อ (ประกาศ/ร้าน/จับคู่)
  return (
    <div className="rounded-xl border border-accent-gold/40 bg-accent-gold/10 p-3 text-sm leading-relaxed text-foreground">
      <p>
        <span aria-hidden>🛡️ </span>
        <strong>TaladKaset เป็นตัวกลางให้ผู้ซื้อ-ผู้ขายเจอกันเท่านั้น</strong>{" "}
        ตกลงราคา/ขนส่งกันเอง — อย่าโอนเงินมัดจำจนกว่าจะเห็นสินค้าหรือมั่นใจในตัวผู้ขาย{" "}
        <Link
          href="/safety"
          className="font-medium whitespace-nowrap text-primary underline underline-offset-2 hover:text-primary-dk"
        >
          วิธีซื้อขายปลอดภัย →
        </Link>
      </p>
    </div>
  );
}
