// หน้ารวมบทความเกษตร — ISR 1 ชม. (SEO engine)

import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/features/articles/queries";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ARTICLE_CATEGORY_VALUES } from "@/config/articleCategories";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "บทความความรู้เกษตร",
  description:
    "รวมบทความความรู้การเกษตร เทคนิคปลูกพืช การใช้ปุ๋ย ป้องกันโรคพืช และข่าวสารเกษตร สำหรับเกษตรกรไทย",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const { items, total } = await getPublishedArticles({
    category: category || undefined,
    page: Number(page) || 1,
  });

  const chipClass =
    "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        บทความความรู้เกษตร
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total.toLocaleString("th-TH")} บทความ — เทคนิค ปุ๋ย โรคพืช และข่าวสารเกษตร
      </p>

      {/* filter หมวด */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/articles"
          className={`${chipClass} ${
            !category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:bg-muted"
          }`}
        >
          ทั้งหมด
        </Link>
        {ARTICLE_CATEGORY_VALUES.map((c) => (
          <Link
            key={c}
            href={`/articles?category=${encodeURIComponent(c)}`}
            className={`${chipClass} ${
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ยังไม่มีบทความในหมวดนี้
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
