// จัดการรายการราคา (P1) — เพิ่ม/แก้/เปิด-ปิด active

import type { Metadata } from "next";
import Link from "next/link";
import { getAllPriceItems, PriceItemForm } from "@/features/prices";
import { togglePriceItemActiveAction } from "@/features/prices/actions";
import { getPriceCategoryLabel } from "@/config/priceCategories";

export const metadata: Metadata = {
  title: "จัดการรายการราคา",
};

export default async function AdminPriceItemsPage() {
  const items = await getAllPriceItems();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-lg font-semibold text-primary-dk">
          จัดการรายการราคา
        </h1>
        <Link
          href="/admin/prices"
          className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          ← กลับหน้ากรอกราคา
        </Link>
      </div>

      <details className="mt-4 rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer font-heading font-semibold text-primary-dk">
          + เพิ่มรายการใหม่
        </summary>
        <div className="mt-3">
          <PriceItemForm />
        </div>
      </details>

      <p className="mt-5 text-sm text-muted-foreground">
        ทั้งหมด {items.length} รายการ (ปิดใช้งาน = ไม่ขึ้นหน้ากรอกราคา/หน้าเว็บ)
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((it) => (
          <li
            key={it.id}
            className={`rounded-xl border border-border bg-card p-3 ${it.active ? "" : "opacity-60"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  {it.name}
                  {!it.active && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      ปิดใช้งาน
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {getPriceCategoryLabel(it.category)} · {it.unit}
                  {it.sourceName ? ` · ${it.sourceName}` : ""} · ลำดับ {it.order}
                </p>
              </div>
              <form action={togglePriceItemActiveAction}>
                <input type="hidden" name="id" value={it.id} />
                <button
                  type="submit"
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {it.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                </button>
              </form>
            </div>

            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-primary">
                แก้ไข
              </summary>
              <div className="mt-2 border-t border-border pt-3">
                <PriceItemForm
                  existing={{
                    id: it.id,
                    name: it.name,
                    category: it.category,
                    unit: it.unit,
                    sourceName: it.sourceName,
                    sourceUrl: it.sourceUrl,
                    order: it.order,
                  }}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
