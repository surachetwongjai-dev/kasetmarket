// บทความรายตัว — ISR 1 ชม., JSON-LD Article, บทความเกี่ยวข้อง, CTA ไปหมวดประกาศ (§8/§9)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/features/articles/queries";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ViewTracker } from "@/features/listings/components/view-tracker";
import { relatedListingCategoryOf } from "@/config/articleCategories";
import { getCategoryLabel } from "@/config/categories";
import { renderMarkdown, stripMarkdown } from "@/lib/markdown";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(decodeURIComponent(slug));
  if (!article) notFound();

  const description = article.excerpt || stripMarkdown(article.content);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      siteName: "KasetMarket",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.coverUrl ? [{ url: article.coverUrl }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(decodeURIComponent(slug));
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const listingCategory = relatedListingCategoryOf(article.category);
  const html = renderMarkdown(article.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverUrl ? [article.coverUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.publishedAt?.toISOString(),
    articleSection: article.category,
    author: { "@type": "Organization", name: "KasetMarket" },
    publisher: { "@type": "Organization", name: "KasetMarket" },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker
        endpoint={`/api/articles/${article.id}/view`}
        dedupeKey={`article:${article.id}`}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href="/articles" className="hover:text-primary hover:underline">
          บทความ
        </Link>
        {" › "}
        <Link
          href={`/articles?category=${encodeURIComponent(article.category)}`}
          className="hover:text-primary hover:underline"
        >
          {article.category}
        </Link>
      </nav>

      <article className="mt-3">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {article.title}
        </h1>
        {article.publishedAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            หมวด {article.category} · เผยแพร่{" "}
            {formatThaiDate(article.publishedAt)} ·{" "}
            {article.views.toLocaleString("th-TH")} ครั้ง
          </p>
        )}

        {article.coverUrl && (
          <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div
          className="article-prose mt-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* CTA: บทความ → หมวดประกาศที่เกี่ยว (ชั้นคอนเทนต์ → รายได้) */}
      {listingCategory && (
        <Link
          href={`/listings?category=${listingCategory}`}
          className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <span className="font-medium text-primary-dk">
            🛒 ดูประกาศขายหมวด{getCategoryLabel(listingCategory)}ในตลาด
          </span>
          <span className="shrink-0 text-primary">→</span>
        </Link>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            บทความที่เกี่ยวข้อง
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
