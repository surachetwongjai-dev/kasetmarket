// sitemap.xml อัตโนมัติ — หน้า static + ประกาศ ACTIVE ทุกรายการ + บทความ published ทุกเรื่อง (§9)

import type { MetadataRoute } from "next";
import { getAllActiveListingSlugs } from "@/features/listings/queries";
import { getAllPublishedArticleSlugs } from "@/features/articles/queries";
import { SITE_URL } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, articles] = await Promise.all([
    getAllActiveListingSlugs(),
    getAllPublishedArticleSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/listings`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/articles`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/listings/${encodeURIComponent(l.slug)}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${encodeURIComponent(a.slug)}`,
    lastModified: a.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...listingPages, ...articlePages];
}
