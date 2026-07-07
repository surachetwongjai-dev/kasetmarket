"use client";

// ฟอร์มเขียน/แก้บทความ (admin CMS) — textarea Markdown + ปุ่มสลับ preview สด
// preview ใช้ marked ฝั่ง client (บทความเขียนโดยแอดมิน = trusted content)

import { useActionState, useState } from "react";
import { marked } from "marked";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ARTICLE_CATEGORY_VALUES } from "@/config/articleCategories";
import type { ArticleFormState } from "../actions";
import { CoverUploader } from "./cover-uploader";

marked.setOptions({ gfm: true, breaks: true });

export type ArticleFormDefaults = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverUrl: string;
  published: boolean;
};

const initialState: ArticleFormState = {};

export function ArticleForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    prev: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
  defaults?: Partial<ArticleFormDefaults>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [content, setContent] = useState(defaults?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">หัวข้อบทความ</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={150}
          defaultValue={defaults?.title}
          placeholder="เช่น ใส่ปุ๋ยข้าวตามระยะ ให้ถูกสูตร ถูกเวลา"
          className="h-11"
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excerpt">คำโปรย (สรุปสั้นๆ แสดงในการ์ด + ผลค้นหา)</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          required
          rows={2}
          maxLength={300}
          defaultValue={defaults?.excerpt}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <FieldError messages={state.fieldErrors?.excerpt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">หมวดหมู่</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue={defaults?.category ?? ""}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              เลือกหมวดหมู่
            </option>
            {ARTICLE_CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.category} />
        </div>

        <label className="flex min-h-11 items-center gap-2.5 self-end text-base">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaults?.published ?? false}
            className="size-5 accent-primary"
          />
          เผยแพร่ทันที (ไม่ติ๊ก = บันทึกเป็นฉบับร่าง)
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>รูปปก</Label>
        <CoverUploader name="coverUrl" initialUrl={defaults?.coverUrl} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">เนื้อหา (Markdown)</Label>
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showPreview ? "✎ กลับไปเขียน" : "👁 ดูตัวอย่าง"}
          </button>
        </div>
        {showPreview ? (
          <div
            className="article-prose min-h-64 rounded-lg border border-border bg-card p-4"
            dangerouslySetInnerHTML={{
              __html: marked.parse(content || "*(ยังไม่มีเนื้อหา)*", {
                async: false,
              }),
            }}
          />
        ) : (
          <textarea
            id="content"
            name="content"
            required
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              "เขียนด้วย Markdown ได้เลย เช่น\n\n## หัวข้อย่อย\n\nเนื้อหาย่อหน้า...\n\n- ข้อ 1\n- ข้อ 2\n\n> ข้อควรระวัง"
            }
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        )}
        {/* preview mode: ยัง submit content ได้ */}
        {showPreview && <input type="hidden" name="content" value={content} />}
        <FieldError messages={state.fieldErrors?.content} />
        <p className="text-xs text-muted-foreground">
          รองรับ Markdown: ## หัวข้อ, **ตัวหนา**, - รายการ, [ลิงก์](url), &gt; คำเตือน
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:self-start sm:px-8"
      >
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
