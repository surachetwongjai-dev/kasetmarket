// Queries ของบทความ — public เห็นเฉพาะ published, admin เห็นทั้งหมด

import { prisma } from "@/lib/prisma";

const ARTICLES_PER_PAGE = 12;

export async function getPublishedArticles(params?: {
  category?: string;
  page?: number;
}) {
  const page = Math.max(1, params?.page ?? 1);
  const where = {
    published: true,
    ...(params?.category ? { category: params.category } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
    }),
  ]);
  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE)),
  };
}

export async function getPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({ where: { slug, published: true } });
}

/** บทความเกี่ยวข้อง: หมวดเดียวกันก่อน ยกเว้นเรื่องปัจจุบัน */
export async function getRelatedArticles(article: {
  id: string;
  category: string;
}) {
  return prisma.article.findMany({
    where: {
      published: true,
      category: article.category,
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}

// ---------- admin ----------

export async function getAllArticlesForAdmin() {
  return prisma.article.findMany({
    orderBy: [{ published: "asc" }, { publishedAt: "desc" }, { id: "desc" }],
  });
}

export async function getArticleForEdit(id: string) {
  return prisma.article.findUnique({ where: { id } });
}

/** slug บทความ published ทั้งหมด (sitemap) */
export async function getAllPublishedArticleSlugs() {
  return prisma.article.findMany({
    where: { published: true },
    select: { slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}
