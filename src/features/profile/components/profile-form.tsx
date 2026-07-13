"use client";

// ฟอร์มแก้โปรไฟล์เกษตรกร (U1) — mobile-first, touch target ≥44px
// validate ฝั่ง server ด้วย zod (schemas.ts) — HTML attributes ดักฝั่ง client ก่อน

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROVINCES, REGIONS } from "@/config/provinces";
import { FARM_TYPES } from "@/config/farmTypes";
import { MAX_BIO } from "../schemas";
import type { ProfileFormState } from "../actions";
import {
  ImageUploader,
  type UploadedImage,
} from "@/features/listings/components/image-uploader";

export type ProfileFormDefaults = {
  name: string;
  province: string;
  district: string;
  bio: string;
  farmTypes: string[];
  products: string;
  sizeRai: string;
  images: UploadedImage[];
};

const initialState: ProfileFormState = {};

export function ProfileForm({
  action,
  defaults,
}: {
  action: (
    prev: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  defaults?: Partial<ProfileFormDefaults>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [images, setImages] = useState<UploadedImage[]>(defaults?.images ?? []);
  const selectedTypes = defaults?.farmTypes ?? [];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.success && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary-dk">
          บันทึกโปรไฟล์เรียบร้อย — แสดงในหน้าโปรไฟล์สาธารณะของคุณแล้ว
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">ชื่อที่แสดง</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          defaultValue={defaults?.name}
          placeholder="เช่น สวนลุงสมชาย / ไร่ข้าวหอมสุรินทร์"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      {/* ที่ตั้งฟาร์ม/ไร่/ร้าน */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="province">จังหวัด</Label>
          <NativeSelect
            id="province"
            name="province"
            defaultValue={defaults?.province ?? ""}
          >
            <option value="">— ไม่ระบุ —</option>
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
          <FieldError messages={state.fieldErrors?.district} />
        </div>
      </div>

      {/* ประเภทกิจการ (เลือกได้หลายอย่าง) */}
      <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-3">
        <legend className="px-1 text-sm font-medium text-muted-foreground">
          ประเภทกิจการ (เลือกได้หลายอย่าง)
        </legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {FARM_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex min-h-11 items-center gap-2.5 text-base"
            >
              <input
                type="checkbox"
                name="farmTypes"
                value={t.value}
                defaultChecked={selectedTypes.includes(t.value)}
                className="size-5 accent-primary"
              />
              <span>
                {t.icon} {t.label}
              </span>
            </label>
          ))}
        </div>
        <FieldError messages={state.fieldErrors?.farmTypes} />
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="products">สินค้าหลัก (ไม่บังคับ)</Label>
          <Input
            id="products"
            name="products"
            maxLength={200}
            defaultValue={defaults?.products}
            placeholder="เช่น ข้าวหอมมะลิ, มะม่วงน้ำดอกไม้"
            className="h-11"
          />
          <FieldError messages={state.fieldErrors?.products} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sizeRai">ขนาดพื้นที่ (ไร่)</Label>
          <Input
            id="sizeRai"
            name="sizeRai"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            defaultValue={defaults?.sizeRai}
            placeholder="เช่น 15"
            className="h-11"
          />
          <FieldError messages={state.fieldErrors?.sizeRai} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">แนะนำตัว/กิจการ (ไม่บังคับ)</Label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={MAX_BIO}
          defaultValue={defaults?.bio}
          placeholder="เล่าเรื่องฟาร์ม/ไร่/ร้านของคุณ ปลูกอะไร ทำมานานแค่ไหน จุดเด่นคืออะไร"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <FieldError messages={state.fieldErrors?.bio} />
      </div>

      {/* รูปฟาร์ม/ไร่/ร้าน ≤4 */}
      <section className="flex flex-col gap-1.5">
        <Label>รูปฟาร์ม/ไร่/หน้าร้าน (สูงสุด 4 รูป)</Label>
        <ImageUploader initial={defaults?.images} max={4} onChange={setImages} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <FieldError messages={state.fieldErrors?.images} />
      </section>

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
        {pending ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
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
