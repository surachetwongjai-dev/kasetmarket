// การ์ดบทความสำหรับหน้ารวม + บทความเกี่ยวข้อง

import Link from "next/link";
import Image from "next/image";
import type { Article } from "@prisma/client";
import { formatThaiDate } from "@/lib/format";

export function ArticleCard({
  article,
}: {
  article: Pick<
    Article,
    "slug" | "title" | "excerpt" | "coverUrl" | "category" | "publishedAt"
  >;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] bg-muted">
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            📄
          </div>
        )}
        <span className="absolute top-2 left-2 rounded bg-primary/90 px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
          {article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 font-heading font-semibold leading-snug">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        {article.publishedAt && (
          <p className="mt-auto pt-1 text-xs text-muted-foreground">
            {formatThaiDate(article.publishedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}
