"use client";

// ฟอร์มลงประกาศ/แก้ไขประกาศ — mobile-first, touch target ≥ 44px
// validate ฝั่ง server ด้วย zod (schemas.ts) — HTML attributes ช่วยดักฝั่ง client ก่อน

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/config/categories";
import { UNITS } from "@/config/units";
import { PROVINCES, REGIONS } from "@/config/provinces";
import type { ListingFormState } from "../actions";
import { ImageUploader, type UploadedImage } from "./image-uploader";

export type ListingFormDefaults = {
  title: string;
  description: string;
  price: string;
  unit: string;
  negotiable: boolean;
  category: string;
  province: string;
  district: string;
  contactPhone: string;
  contactLine: string;
  images: UploadedImage[];
};

const initialState: ListingFormState = {};

export function ListingForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    prev: ListingFormState,
    formData: FormData,
  ) => Promise<ListingFormState>;
  defaults?: Partial<ListingFormDefaults>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [images, setImages] = useState<UploadedImage[]>(
    defaults?.images ?? [],
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* รูปสินค้า */}
      <section className="flex flex-col gap-1.5">
        <Label>รูปสินค้า</Label>
        <ImageUploader initial={defaults?.images} onChange={setImages} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <FieldError messages={state.fieldErrors?.images} />
      </section>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">ชื่อประกาศ</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={100}
          defaultValue={defaults?.title}
          placeholder="เช่น ขายข้าวหอมมะลิ 105 เกี่ยวใหม่"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">รายละเอียด</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={4000}
          defaultValue={defaults?.description}
          placeholder="บอกผู้ซื้อให้ครบ: สภาพสินค้า จำนวนที่มี วิธีรับของ/จัดส่ง"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      {/* ราคา + หน่วย */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">ราคา (บาท)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={defaults?.price}
            placeholder="0"
            className="h-11"
          />
          <FieldError messages={state.fieldErrors?.price} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unit">ต่อหน่วย</Label>
          <NativeSelect
            id="unit"
            name="unit"
            required
            defaultValue={defaults?.unit ?? ""}
          >
            <option value="" disabled>
              เลือกหน่วย
            </option>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                บาท/{u.label}
              </option>
            ))}
          </NativeSelect>
          <FieldError messages={state.fieldErrors?.unit} />
        </div>
      </div>

      <label className="flex min-h-11 items-center gap-2.5 text-base">
        <input
          type="checkbox"
          name="negotiable"
          defaultChecked={defaults?.negotiable ?? true}
          className="size-5 accent-primary"
        />
        ราคาต่อรองได้
      </label>

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

      {/* จังหวัด/อำเภอ */}
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

      {/* ช่องทางติดต่อ */}
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
          <FieldError messages={state.fieldErrors?.contactLine} />
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
