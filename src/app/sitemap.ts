// sitemap.xml อัตโนมัติ — หน้า static + ประกาศ ACTIVE + บทความ published (§9)
// + ทุกหน้า directory ร้านค้า เฉพาะหน้าที่มีร้านจริง (§10 — ห้ามใส่หน้าเปล่า)

import type { MetadataRoute } from "next";
import { getAllActiveListingSlugs } from "@/features/listings/queries";
import { getAllPublishedArticleSlugs } from "@/features/articles/queries";
import { getAllApprovedShops } from "@/features/directory/queries";
import {
  DIRECTORY_BASE,
  provincePath,
  categoryPath,
  shopPath,
} from "@/features/directory/paths";
import { absoluteUrl } from "@/features/directory/seo";
import {
  getPriceItemsForSitemap,
  PRICES_BASE,
  pricePath,
  priceAbsoluteUrl,
} from "@/features/prices";
import {
  getMatchPostsForSitemap,
  MATCHING_BASE,
  matchPostPath,
  matchAbsoluteUrl,
} from "@/features/matching";
import {
  getThreadsForSitemap,
  COMMUNITY_BASE,
  threadPath,
  communityAbsoluteUrl,
} from "@/features/community";
import { shippingAbsoluteUrl } from "@/features/shipping";
import { getShopCategory } from "@/config/shopCategories";
import { FLAGS } from "@/config/flags";
import { SITE_URL } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, articles, shops, priceItems, matchPosts, threads] =
    await Promise.all([
      getAllActiveListingSlugs(),
      getAllPublishedArticleSlugs(),
      getAllApprovedShops(),
      FLAGS.PRICES ? getPriceItemsForSitemap() : Promise.resolve([]),
      FLAGS.MATCHING ? getMatchPostsForSitemap() : Promise.resolve([]),
      FLAGS.COMMUNITY ? getThreadsForSitemap() : Promise.resolve([]),
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

  // directory: จังหวัด × หมวด × ร้าน — สร้างจากร้าน APPROVED จริงเท่านั้น
  const provinceSet = new Set<string>();
  const categoryPaths = new Set<string>();
  for (const shop of shops) {
    provinceSet.add(shop.province);
    for (const value of shop.categories) {
      const category = getShopCategory(value);
      if (category) categoryPaths.add(categoryPath(shop.province, category.slug));
    }
  }

  const directoryPages: MetadataRoute.Sitemap = [
    ...(shops.length
      ? [
          {
            url: absoluteUrl(DIRECTORY_BASE),
            changeFrequency: "daily" as const,
            priority: 0.8,
          },
        ]
      : []),
    ...[...provinceSet].map((province) => ({
      url: absoluteUrl(provincePath(province)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...[...categoryPaths].map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: 0.8, // หน้าดัก keyword หลัก
    })),
    ...shops.map((shop) => ({
      url: absoluteUrl(shopPath(shop)),
      lastModified: shop.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  // ราคากลาง: หน้ารวม + รายตัวเฉพาะที่มีข้อมูล (หลัง FLAGS.PRICES)
  const pricePages: MetadataRoute.Sitemap = priceItems.length
    ? [
        {
          url: priceAbsoluteUrl(PRICES_BASE),
          changeFrequency: "daily",
          priority: 0.8,
        },
        ...priceItems.map((p) => ({
          url: priceAbsoluteUrl(pricePath(p.slug)),
          lastModified: p.lastModified ?? undefined,
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
      ]
    : [];

  // กระดานจับคู่: หน้ารวม + รายตัว ACTIVE (หลัง FLAGS.MATCHING)
  const matchingPages: MetadataRoute.Sitemap = matchPosts.length
    ? [
        {
          url: matchAbsoluteUrl(MATCHING_BASE),
          changeFrequency: "daily",
          priority: 0.8,
        },
        ...matchPosts.map((p) => ({
          url: matchAbsoluteUrl(matchPostPath(p.slug)),
          lastModified: p.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
      ]
    : [];

  // ชุมชน: หน้ารวม + กระทู้ไม่ hidden (หลัง FLAGS.COMMUNITY)
  const communityPages: MetadataRoute.Sitemap = threads.length
    ? [
        {
          url: communityAbsoluteUrl(COMMUNITY_BASE),
          changeFrequency: "daily",
          priority: 0.7,
        },
        ...threads.map((t) => ({
          url: communityAbsoluteUrl(threadPath(t.slug)),
          lastModified: t.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        })),
      ]
    : [];

  // เช็คค่าส่ง: หน้า utility เดี่ยว (หลัง FLAGS.SHIPPING_RATES)
  const shippingPages: MetadataRoute.Sitemap = FLAGS.SHIPPING_RATES
    ? [
        {
          url: shippingAbsoluteUrl(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
      ]
    : [];

  return [
    ...staticPages,
    ...listingPages,
    ...articlePages,
    ...directoryPages,
    ...pricePages,
    ...matchingPages,
    ...communityPages,
    ...shippingPages,
  ];
}
