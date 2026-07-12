"use client";

// ฟอร์มเพิ่ม/แก้รายการราคา (PriceItem) — ใช้ทั้งสร้างและแก้ไข

import { useActionState } from "react";
import {
  createPriceItemAction,
  updatePriceItemAction,
  type PriceFormState,
} from "../actions";
import { PRICE_CATEGORIES } from "@/config/priceCategories";

const initial: PriceFormState = {};

export type PriceItemValues = {
  id: string;
  name: string;
  category: string;
  unit: string;
  sourceName: string | null;
  sourceUrl: string | null;
  order: number;
};

const fieldCls =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PriceItemForm({ existing }: { existing?: PriceItemValues }) {
  const [state, formAction, pending] = useActionState(
    existing ? updatePriceItemAction : createPriceItemAction,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          ชื่อรายการ
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={existing?.name ?? ""}
            placeholder="เช่น ข้าวเปลือกหอมมะลิ"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          หมวด
          <select
            name="category"
            defaultValue={existing?.category ?? PRICE_CATEGORIES[0].value}
            className={fieldCls}
          >
            {PRICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          หน่วย
          <input
            name="unit"
            required
            maxLength={30}
            defaultValue={existing?.unit ?? ""}
            placeholder="เช่น บาท/กก. บาท/ตัน บาท/ฟอง"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          ลำดับการแสดง
          <input
            name="order"
            type="number"
            min="0"
            defaultValue={existing?.order ?? ""}
            placeholder="ยิ่งน้อยยิ่งขึ้นก่อน"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          แหล่งอ้างอิง (ไม่บังคับ)
          <input
            name="sourceName"
            maxLength={100}
            defaultValue={existing?.sourceName ?? ""}
            placeholder="เช่น สำนักงานเศรษฐกิจการเกษตร"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          ลิงก์แหล่งอ้างอิง (ไม่บังคับ)
          <input
            name="sourceUrl"
            type="url"
            maxLength={300}
            defaultValue={existing?.sourceUrl ?? ""}
            placeholder="https://..."
            className={fieldCls}
          />
        </label>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm font-medium text-primary">
          {existing ? "บันทึกการแก้ไขแล้ว" : "เพิ่มรายการแล้ว"}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 self-start rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : existing ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
      </button>
    </form>
  );
}
