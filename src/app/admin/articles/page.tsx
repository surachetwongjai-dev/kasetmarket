// จัดการบทความ (M8) — list ทั้งหมด + สถานะเผยแพร่/ร่าง

import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticlesForAdmin } from "@/features/articles/queries";
import { ArticleAdminActions } from "@/features/articles/components/article-admin-actions";
import { formatThaiDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "จัดการบทความ",
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const articles = await getAllArticlesForAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          ทั้งหมด {articles.length} บทความ
        </p>
        <Link
          href="/admin/articles/new"
          className="flex h-11 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          + เขียนบทความใหม่
        </Link>
      </div>

      {saved && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary-dk">
          บันทึกบทความแล้ว
        </p>
      )}

      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ยังไม่มีบทความ — เขียนเรื่องแรกเพื่อเริ่มเครื่องยนต์ SEO
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {articles.map((article) => (
            <li
              key={article.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 font-medium">
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {article.category}
                  </span>
                  {article.published ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      เผยแพร่แล้ว
                    </span>
                  ) : (
                    <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-xs text-accent-foreground">
                      ฉบับร่าง
                    </span>
                  )}
                  <span className="truncate">{article.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {article.publishedAt
                    ? `เผยแพร่ ${formatThaiDate(article.publishedAt)}`
                    : "ยังไม่เผยแพร่"}
                  {" · "}
                  {article.views.toLocaleString("th-TH")} วิว
                </p>
              </div>
              <ArticleAdminActions
                id={article.id}
                published={article.published}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
