// แก้ไขบทความ (M8)

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateArticleAction } from "@/features/articles/actions";
import { ArticleForm } from "@/features/articles/components/article-form";
import { getArticleForEdit } from "@/features/articles/queries";

export const metadata: Metadata = {
  title: "แก้ไขบทความ",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleForEdit(id);
  if (!article) notFound();

  const action = updateArticleAction.bind(null, article.id);

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 font-heading text-xl font-bold text-primary-dk">
        แก้ไขบทความ
      </h2>
      <ArticleForm
        action={action}
        submitLabel="บันทึกการแก้ไข"
        defaults={{
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          coverUrl: article.coverUrl ?? "",
          published: article.published,
        }}
      />
    </div>
  );
}
