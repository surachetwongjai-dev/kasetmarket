// เขียนบทความใหม่ (M8)

import type { Metadata } from "next";
import { createArticleAction } from "@/features/articles/actions";
import { ArticleForm } from "@/features/articles/components/article-form";

export const metadata: Metadata = {
  title: "เขียนบทความใหม่",
};

export default function NewArticlePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 font-heading text-xl font-bold text-primary-dk">
        เขียนบทความใหม่
      </h2>
      <ArticleForm action={createArticleAction} submitLabel="บันทึกบทความ" />
    </div>
  );
}
