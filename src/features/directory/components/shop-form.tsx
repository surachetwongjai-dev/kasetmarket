"use client";

// ฟอร์มข้อมูลร้าน — ใช้ 2 โหมด: ลงทะเบียน (public, มี honeypot) + แก้ไข (admin)
// form GET-style validation ฝั่ง server ผ่าน zod ใน action (แพทเทิร์นเดียวกับ ListingForm M5)

import { useActionState, useState } from "react";
import type { Shop, ShopImage } from "@prisma/client";
import {
  ImageUploader,
  type UploadedImage,
} from "@/features/listings/components/image-uploader";
import { SHOP_CATEGORIES } from "@/config/shopCategories";
import { PROVINCES, REGIONS } from "@/config/provinces";
import { MAX_SHOP_IMAGES } from "../schemas";
import type { ShopFormState } from "../actions";

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "text-sm font-medium";

export function ShopForm({
  action,
  initial,
  mode,
}: {
  action: (prev: ShopFormState, formData: FormData) => Promise<ShopFormState>;
  /** ข้อมูลร้านเดิม (โหมดแก้ไขของแอดมิน) */
  initial?: Shop & { images: ShopImage[] };
  mode: "register" | "admin-edit";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [images, setImages] = useState<UploadedImage[]>(
    initial?.images.map((img) => ({ key: img.url, url: img.url })) ?? [],
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      {/* honeypot — ซ่อนจากคนจริง (bot ชอบกรอกทุกช่อง) ห้ามใช้ display:none เพราะ bot ฉลาดตรวจได้ */}
      {mode === "register" && (
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        >
          <label>
            เว็บไซต์ (อย่ากรอกช่องนี้)
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="shop-name" className={labelClass}>
          ชื่อร้าน *
        </label>
        <input
          id="shop-name"
          name="name"
          required
          maxLength={100}
          defaultValue={initial?.name}
          placeholder="เช่น ร้านเจริญเกษตรภัณฑ์"
          className={inputClass}
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={labelClass}>ประเภทร้าน * (เลือกได้หลายหมวด)</legend>
        <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {SHOP_CATEGORIES.map((c) => (
            <label
              key={c.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="checkbox"
                name="categories"
                value={c.value}
                defaultChecked={initial?.categories.includes(c.value)}
                className="size-4 accent-primary"
              />
              {c.icon} {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="shop-province" className={labelClass}>
            จังหวัด *
          </label>
          <select
            id="shop-province"
            name="province"
            required
            defaultValue={initial?.province ?? ""}
            className={inputClass}
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
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="shop-district" className={labelClass}>
            อำเภอ
          </label>
          <input
            id="shop-district"
            name="district"
            maxLength={100}
            defaultValue={initial?.district ?? ""}
            placeholder="เช่น เมืองนครสวรรค์"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="shop-address" className={labelClass}>
          ที่อยู่ร้าน
        </label>
        <input
          id="shop-address"
          name="address"
          maxLength={200}
          defaultValue={initial?.address ?? ""}
          placeholder="บ้านเลขที่ ถนน ตำบล"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="shop-phone" className={labelClass}>
            เบอร์โทรร้าน *
          </label>
          <input
            id="shop-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={initial?.phone ?? ""}
            placeholder="เช่น 081-234-5678"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="shop-line" className={labelClass}>
            LINE ID
          </label>
          <input
            id="shop-line"
            name="lineId"
            maxLength={100}
            defaultValue={initial?.lineId ?? ""}
            placeholder="เช่น @shopline หรือ 0812345678"
            className={inputClass}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        * ต้องมีเบอร์โทรหรือ LINE อย่างน้อย 1 อย่าง เพื่อให้ลูกค้าติดต่อร้านได้
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="shop-fb" className={labelClass}>
            ลิงก์ Facebook ร้าน
          </label>
          <input
            id="shop-fb"
            name="facebookUrl"
            type="url"
            maxLength={300}
            defaultValue={initial?.facebookUrl ?? ""}
            placeholder="https://facebook.com/..."
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="shop-hours" className={labelClass}>
            เวลาเปิดทำการ
          </label>
          <input
            id="shop-hours"
            name="openHours"
            maxLength={100}
            defaultValue={initial?.openHours ?? ""}
            placeholder="เช่น จ-ส 8:00-17:00"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="shop-description" className={labelClass}>
          แนะนำร้าน / สินค้าเด่น
        </label>
        <textarea
          id="shop-description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={initial?.description ?? ""}
          placeholder="ขายอะไรบ้าง มีบริการอะไรพิเศษ เช่น ส่งถึงที่ รับสั่งจำนวนมาก (เว้นว่างได้ ระบบจะเขียนให้อัตโนมัติ)"
          className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>รูปร้าน (สูงสุด {MAX_SHOP_IMAGES} รูป)</span>
        <ImageUploader
          initial={initial?.images.map((img) => ({ key: img.url, url: img.url }))}
          onChange={setImages}
          max={MAX_SHOP_IMAGES}
          endpoint={mode === "register" ? "/api/upload/shop" : "/api/upload"}
        />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending
          ? "กำลังส่ง..."
          : mode === "register"
            ? "ส่งข้อมูลร้าน (รอตรวจสอบ 1-2 วัน)"
            : "บันทึกข้อมูลร้าน"}
      </button>
    </form>
  );
}
