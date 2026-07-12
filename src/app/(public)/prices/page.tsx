// หน้ารวมราคากลางสินค้าเกษตร (P2) — ISR 1 ชม. + revalidate เมื่อแอดมินบันทึก
// URL สาธารณะ /ราคาสินค้าเกษตร (rewrite → /prices) · หลัง FLAGS.PRICES

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import { PRICE_CATEGORIES } from "@/config/priceCategories";
import {
  getPriceOverview,
  pricePath,
  priceChange,
  formatRange,
  isStale,
  PriceChange,
} from "@/features/prices";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  if (!FLAGS.PRICES) return {};
  const { lastUpdated } = await getPriceOverview();
  const dateStr = lastUpdated ? formatThaiDate(lastUpdated) : "";
  return {
    title: `ราคากลางสินค้าเกษตรวันนี้${dateStr ? ` — อัปเดต ${dateStr}` : ""}`,
    description:
      "ราคากลางสินค้าเกษตรรายวัน ข้าว มันสำปะหลัง ทุเรียน สุกร ไข่ไก่ และอื่นๆ อัปเดตล่าสุด พร้อมการเปลี่ยนแปลงราคา",
    alternates: { canonical: "/ราคาสินค้าเกษตร" },
  };
}

export default async function PricesHubPage() {
  if (!FLAGS.PRICES) notFound();

  const { items, lastUpdated } = await getPriceOverview();

  const groups = PRICE_CATEGORIES.map((cat) => ({
    ...cat,
    rows: items.filter((it) => it.category === cat.value),
  })).filter((g) => g.rows.length > 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        ราคากลางสินค้าเกษตรวันนี้
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lastUpdated ? (
          <>อัปเดตล่าสุด {formatThaiDate(lastUpdated)}</>
        ) : (
          <>ยังไม่มีข้อมูลราคา</>
        )}
      </p>

      {lastUpdated && isStale(lastUpdated) && (
        <p className="mt-2 rounded-lg border border-accent-gold/40 bg-accent-gold/10 p-2.5 text-sm text-foreground">
          ⚠️ ราคายังไม่ได้อัปเดตในช่วง 7 วันที่ผ่านมา — โปรดใช้เป็นค่าอ้างอิงเบื้องต้น
        </p>
      )}

      {groups.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ยังไม่มีข้อมูลราคาในขณะนี้
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.value} className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-primary-dk">
              {g.icon} {g.label}
            </h2>
            <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">รายการ</th>
                    <th className="px-3 py-2 text-right font-medium">ราคาล่าสุด</th>
                    <th className="px-3 py-2 text-right font-medium">เปลี่ยน</th>
                    <th className="px-3 py-2 text-right font-medium">ณ วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((it) => {
                    const latest = it.entries[0];
                    const change = priceChange(latest, it.entries[1]);
                    return (
                      <tr
                        key={it.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-3 py-2.5">
                          <Link
                            href={pricePath(it.slug)}
                            className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                          >
                            {it.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span className="font-num font-semibold text-foreground">
                            {formatRange(latest)}
                          </span>{" "}
                          <span className="text-xs text-muted-foreground">
                            {it.unit}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <PriceChange change={change} />
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap text-xs text-muted-foreground">
                          {formatThaiDate(latest.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        หมายเหตุ: ราคาข้างต้นเป็น<strong>ราคาอ้างอิง</strong>
        อาจแตกต่างตามพื้นที่ คุณภาพ ฤดูกาล และผู้รับซื้อ
        โปรดตรวจสอบราคาจริงกับผู้ซื้อ/ผู้ขายก่อนตัดสินใจ
      </p>
    </main>
  );
}
