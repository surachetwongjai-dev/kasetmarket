"use client";

// ฟอร์มตั้งกระทู้ (C1) — ล็อกอินแล้วเท่านั้น (หน้าเช็ค session ก่อน render)

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { MAX_THREAD_BODY, MAX_THREAD_TITLE } from "../schemas";
import type { ThreadFormState } from "../actions";
import {
  ImageUploader,
  type UploadedImage,
} from "@/features/listings/components/image-uploader";

const initialState: ThreadFormState = {};

export function ThreadForm({
  action,
  defaultCategory,
}: {
  action: (
    prev: ThreadFormState,
    formData: FormData,
  ) => Promise<ThreadFormState>;
  defaultCategory?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">หัวข้อ</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={MAX_THREAD_TITLE}
          placeholder="เช่น ข้าวใบเหลืองช่วงแตกกอ แก้ยังไงดี"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">หมวด</Label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultCategory ?? ""}
          className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            เลือกหมวด
          </option>
          {FORUM_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.category} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">เนื้อหา</Label>
        <textarea
          id="body"
          name="body"
          required
          rows={7}
          maxLength={MAX_THREAD_BODY}
          placeholder="เล่าปัญหา/คำถามให้ละเอียด ยิ่งบอกข้อมูลครบ เพื่อนเกษตรกรยิ่งช่วยได้ตรงจุด"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <FieldError messages={state.fieldErrors?.body} />
      </div>

      <section className="flex flex-col gap-1.5">
        <Label>รูปประกอบ (ไม่บังคับ สูงสุด 3 รูป)</Label>
        <ImageUploader max={3} onChange={setImages} />
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
        {pending ? "กำลังโพส..." : "ตั้งกระทู้"}
      </button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
