// กรอกราคากลางรายวัน (P1) — ตารางเดียวจบ + prefill ค่าล่าสุด · admin only (layout ตรวจ role)

import type { Metadata } from "next";
import Link from "next/link";
import {
  bangkokTodayStr,
  getItemsForDailyEntry,
  PriceEntryForm,
} from "@/features/prices";
import type {
  EntryGroup,
  EntryRow,
} from "@/features/prices/components/price-entry-form";
import { PRICE_CATEGORIES } from "@/config/priceCategories";
import { DATE_RE } from "@/features/prices/schemas";

export const metadata: Metadata = {
  title: "กรอกราคากลางรายวัน",
};

const dec = (v: unknown) => (v == null ? "" : String(Number(v)));

export default async function AdminPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date && DATE_RE.test(sp.date) ? sp.date : bangkokTodayStr();

  const items = await getItemsForDailyEntry(date);

  // จัดกลุ่มตามลำดับหมวดใน config
  const groups: EntryGroup[] = PRICE_CATEGORIES.map((cat) => {
    const rows: EntryRow[] = items
      .filter((it) => it.category === cat.value)
      .map((it) => {
        const e = it.entries[0];
        const entryDate = e ? e.date.toISOString().slice(0, 10) : null;
        return {
          id: it.id,
          name: it.name,
          unit: it.unit,
          min: dec(e?.priceMin),
          max: dec(e?.priceMax),
          fromDate: entryDate,
          isForSelectedDate: entryDate === date,
        };
      });
    return { category: cat.value, label: cat.label, icon: cat.icon, rows };
  }).filter((g) => g.rows.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-lg font-semibold text-primary-dk">
            กรอกราคากลางรายวัน
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            กรอกเฉพาะรายการที่เปลี่ยน แล้วกดบันทึกทีเดียว · ช่องว่าง = ไม่บันทึก
          </p>
        </div>
        <Link
          href="/admin/prices/items"
          className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          ⚙️ จัดการรายการ
        </Link>
      </div>

      <form method="get" className="mt-3 flex items-center gap-2">
        <label className="text-sm text-muted-foreground">เลือกวันที่</label>
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          ดูวันนี้
        </button>
      </form>

      {groups.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ยังไม่มีรายการราคาที่เปิดใช้งาน —{" "}
          <Link href="/admin/prices/items" className="text-primary hover:underline">
            เพิ่มรายการ
          </Link>
        </div>
      ) : (
        <PriceEntryForm date={date} groups={groups} />
      )}
    </div>
  );
}
