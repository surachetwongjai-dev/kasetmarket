"use client";

// ฟอร์มโพส/แก้ไขกระดานจับคู่ซื้อขาย (B1) — mobile-first, touch target ≥44px
// เลือกประเภทก่อน (label ภาษาคน) · validate ฝั่ง server ด้วย zod

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/config/categories";
import { PROVINCES, REGIONS } from "@/config/provinces";
import { MATCH_TYPES, type MatchTypeValue } from "@/config/matchTypes";
import type { MatchPostFormState } from "../actions";

export type MatchPostFormDefaults = {
  type: MatchTypeValue;
  title: string;
  detail: string;
  category: string;
  province: string;
  district: string;
  quantity: string;
  targetDate: string; // YYYY-MM-DD
  priceNote: string;
  contactPhone: string;
  contactLine: string;
};

const initialState: MatchPostFormState = {};

export function MatchPostForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    prev: MatchPostFormState,
    formData: FormData,
  ) => Promise<MatchPostFormState>;
  defaults?: Partial<MatchPostFormDefaults>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* ประเภทโพส */}
      <fieldset className="flex flex-col gap-2">
        <Label>ประเภทโพส</Label>
        {MATCH_TYPES.map((t) => (
          <label
            key={t.value}
            className="flex min-h-12 items-center gap-3 rounded-lg border border-border px-3 text-base has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="radio"
              name="type"
              value={t.value}
              required
              defaultChecked={(defaults?.type ?? "SUPPLY") === t.value}
              className="size-5 accent-primary"
            />
            <span>
              {t.icon} {t.formLabel}
            </span>
          </label>
        ))}
        <FieldError messages={state.fieldErrors?.type} />
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">หัวข้อ</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={defaults?.title}
          placeholder="เช่น มะม่วงน้ำดอกไม้พร้อมตัด 5 ตัน กลางเดือนหน้า"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="detail">รายละเอียด</Label>
        <textarea
          id="detail"
          name="detail"
          required
          rows={5}
          maxLength={4000}
          defaultValue={defaults?.detail}
          placeholder="สเปคให้ครบ: เกรด ความชื้น ขนาด การบรรจุ เงื่อนไขรับ-ส่ง"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <FieldError messages={state.fieldErrors?.detail} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">หมวดหมู่</Label>
        <NativeSelect
          id="category"
          name="category"
          required
          defaultValue={defaults?.category ?? ""}
        >
          <option value="" disabled>
            เลือกหมวดหมู่
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </NativeSelect>
        <FieldError messages={state.fieldErrors?.category} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">ปริมาณ</Label>
          <Input
            id="quantity"
            name="quantity"
            required
            maxLength={100}
            defaultValue={defaults?.quantity}
            placeholder="เช่น 5 ตัน, 300 กก./สัปดาห์"
            className="h-11"
          />
          <FieldError messages={state.fieldErrors?.quantity} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetDate">วันที่เป้าหมาย (ไม่บังคับ)</Label>
          <Input
            id="targetDate"
            name="targetDate"
            type="date"
            defaultValue={defaults?.targetDate}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            เสนอขาย = พร้อมส่ง · รับซื้อ = ต้องการภายใน
          </p>
          <FieldError messages={state.fieldErrors?.targetDate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="province">จังหวัด</Label>
          <NativeSelect
            id="province"
            name="province"
            required
            defaultValue={defaults?.province ?? ""}
          >
            <option value="" disabled>
              เลือกจังหวัด
            </option>
            {REGIONS.map((region) => (
              <optgroup key={region} label={`ภาค${region}`}>
                {PROVINCES.filter((p) => p.region === region).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </NativeSelect>
          <FieldError messages={state.fieldErrors?.province} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="district">อำเภอ (ไม่บังคับ)</Label>
          <Input
            id="district"
            name="district"
            maxLength={100}
            defaultValue={defaults?.district}
            placeholder="เช่น ปราสาท"
            className="h-11"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="priceNote">หมายเหตุราคา (ไม่บังคับ)</Label>
        <Input
          id="priceNote"
          name="priceNote"
          maxLength={200}
          defaultValue={defaults?.priceNote}
          placeholder="เช่น ราคาตามตลาด / เสนอราคามาได้"
          className="h-11"
        />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <legend className="px-1 text-sm font-medium text-muted-foreground">
          ช่องทางติดต่อ (ต้องมีอย่างน้อย 1 อย่าง)
        </legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPhone">เบอร์โทร</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            inputMode="tel"
            maxLength={10}
            defaultValue={defaults?.contactPhone}
            placeholder="0812345678"
            className="h-11"
          />
          <FieldError messages={state.fieldErrors?.contactPhone} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactLine">LINE ID</Label>
          <Input
            id="contactLine"
            name="contactLine"
            maxLength={100}
            defaultValue={defaults?.contactLine}
            placeholder="เช่น @kasetshop หรือ somchai99"
            className="h-11"
          />
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}

function NativeSelect(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
