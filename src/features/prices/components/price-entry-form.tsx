"use client";

// ตารางกรอกราคารายวัน — บันทึกทีเดียวทั้งหน้า (P1)
// prefill ค่าล่าสุด ≤ วันที่เลือก · ช่องว่าง = ไม่บันทึกรายการนั้น

import { useActionState } from "react";
import { saveDailyPricesAction, type PriceFormState } from "../actions";

const initial: PriceFormState = {};

export type EntryRow = {
  id: string;
  name: string;
  unit: string;
  min: string;
  max: string;
  fromDate: string | null; // วันที่ของค่าที่ prefill (null = ยังไม่เคยมีราคา)
  isForSelectedDate: boolean; // ค่าที่ prefill เป็นของวันที่เลือกเอง (บันทึกแล้ว)
};

export type EntryGroup = {
  category: string;
  label: string;
  icon: string;
  rows: EntryRow[];
};

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-28";

export function PriceEntryForm({
  date,
  groups,
}: {
  date: string;
  groups: EntryGroup[];
}) {
  const [state, formAction, pending] = useActionState(
    saveDailyPricesAction,
    initial,
  );

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="date" value={date} />

      {groups.map((g) => (
        <section key={g.category} className="mt-5">
          <h2 className="font-heading text-base font-semibold text-primary-dk">
            {g.icon} {g.label}
          </h2>
          <div className="mt-1 rounded-xl border border-border bg-card">
            {g.rows.map((r) => (
              <div key={r.id} className="border-b border-border px-3 py-2.5 last:border-b-0">
                <label
                  htmlFor={`min_${r.id}`}
                  className="block text-sm font-medium text-foreground"
                >
                  {r.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({r.unit})
                  </span>
                  {!r.isForSelectedDate && r.fromDate && (
                    <span className="ml-1 text-xs font-normal text-accent-gold-foreground">
                      · ค่าเมื่อ {r.fromDate} (แก้/ยืนยันได้)
                    </span>
                  )}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id={`min_${r.id}`}
                    name={`min_${r.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    defaultValue={r.min}
                    placeholder="ต่ำสุด"
                    className={inputCls}
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    name={`max_${r.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    defaultValue={r.max}
                    placeholder="สูงสุด (ถ้ามี)"
                    className={inputCls}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 mt-5 flex flex-col gap-1 border-t border-border bg-background/95 py-3 backdrop-blur">
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && (
          <p className="text-sm font-medium text-primary">
            บันทึกแล้ว {state.savedCount?.toLocaleString("th-TH")} รายการ (วันที่ {date})
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก..." : `บันทึกราคาวันที่ ${date}`}
        </button>
      </div>
    </form>
  );
}
