// หน้าโปรไฟล์ร้าน — ISR 1 ชม. + on-demand revalidate เมื่อแอดมิน approve/แก้ (D5 actions)
// URL ต้องตรงทั้งจังหวัด+หมวด+slug ถึงจะ render (กัน duplicate URL — canonical คือหมวดแรกของร้าน)

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getApprovedShopBySlug,
  getListingsNearShop,
  getArticlesForListingCategories,
} from "@/features/directory/queries";
import {
  DIRECTORY_BASE,
  provincePath,
  categoryPath,
  shopPath,
} from "@/features/directory/paths";
import { ListingGallery } from "@/features/listings/components/listing-gallery";
import { ContactButtons } from "@/features/listings/components/contact-buttons";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ArticleCard } from "@/features/articles/components/article-card";
import {
  breadcrumbJsonLd,
  localBusinessJsonLd,
} from "@/features/directory/seo";
import {
  getShopCategory,
  shopCategoryBySlug,
  listingCategoriesOfShop,
} from "@/config/shopCategories";

export const revalidate = 3600;

type Props = {
  params: Promise<{ province: string; category: string; slug: string }>;
};

async function resolveShop({ params }: Props) {
  const raw = await params;
  const province = decodeURIComponent(raw.province);
  const category = shopCategoryBySlug(decodeURIComponent(raw.category));
  const shop = await getApprovedShopBySlug(decodeURIComponent(raw.slug));
  if (
    !shop ||
    !category ||
    shop.province !== province ||
    !shop.categories.includes(category.value)
  )
    notFound();
  return { shop, category };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { shop } = await resolveShop(props);
  const title = `${shop.name} ${shop.district ? `อ.${shop.district} ` : ""}จ.${shop.province} — เบอร์โทร ที่อยู่ เวลาเปิด`;
  return {
    title,
    description: shop.description.slice(0, 160),
    alternates: { canonical: shopPath(shop) },
    openGraph: {
      title,
      description: shop.description.slice(0, 160),
      type: "website",
      siteName: "KasetMarket",
      images: shop.images[0] ? [{ url: shop.images[0].url }] : undefined,
    },
  };
}

export default async function ShopProfilePage(props: Props) {
  const { shop, category } = await resolveShop(props);

  // cross-link (D3): ประกาศ+บทความ ผ่าน mapping หมวดร้าน↔หมวดประกาศใน config เท่านั้น
  const [nearbyListings, relatedArticles] = await Promise.all([
    getListingsNearShop(shop),
    getArticlesForListingCategories(listingCategoriesOfShop(shop.categories)),
  ]);

  const mapsHref =
    shop.lat != null && shop.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
      : shop.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [shop.address, shop.district && `อ.${shop.district}`, `จ.${shop.province}`]
              .filter(Boolean)
              .join(" "),
          )}`
        : null;

  // JSON-LD (D4): LocalBusiness (รวม geo/openHours/telephone) + BreadcrumbList
  const jsonLd = [
    localBusinessJsonLd(shop),
    breadcrumbJsonLd([
      { name: "ร้านค้าเกษตร", path: DIRECTORY_BASE },
      { name: shop.province, path: provincePath(shop.province) },
      { name: category.label, path: categoryPath(shop.province, category.slug) },
      { name: shop.name, path: shopPath(shop) },
    ]),
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-muted-foreground">
        <Link href={DIRECTORY_BASE} className="hover:text-primary hover:underline">
          ร้านค้าเกษตร
        </Link>
        {" › "}
        <Link
          href={provincePath(shop.province)}
          className="hover:text-primary hover:underline"
        >
          {shop.province}
        </Link>
        {" › "}
        <Link
          href={categoryPath(shop.province, category.slug)}
          className="hover:text-primary hover:underline"
        >
          {category.label}
        </Link>
      </nav>

      <div className="mt-3 grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <ListingGallery images={shop.images} title={shop.name} />

          <h1 className="mt-4 flex flex-wrap items-center gap-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
            {shop.name}
            {shop.featured && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
                ร้านแนะนำ
              </span>
            )}
          </h1>

          {/* หมวดของร้าน — ลิงก์กลับหน้าหมวดในจังหวัดเดียวกัน */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {shop.categories.map((value) => {
              const c = getShopCategory(value);
              if (!c) return null;
              return (
                <Link
                  key={value}
                  href={categoryPath(shop.province, c.slug)}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {c.icon} {c.label}
                </Link>
              );
            })}
          </div>

          <section className="mt-5">
            <h2 className="font-heading text-lg font-semibold">เกี่ยวกับร้าน</h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
              {shop.description}
            </p>
          </section>
        </div>

        {/* ข้อมูลติดต่อ (desktop: sidebar / mobile: ปุ่มโทร/LINE sticky ล่าง) */}
        <aside className="flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              ข้อมูลร้าน
            </h2>
            <dl className="mt-2 flex flex-col gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">ที่อยู่</dt>
                <dd>
                  {shop.address ? `${shop.address} · ` : ""}
                  {shop.district ? `อ.${shop.district} ` : ""}จ.{shop.province}
                </dd>
              </div>
              {shop.openHours && (
                <div>
                  <dt className="text-xs text-muted-foreground">เวลาเปิด</dt>
                  <dd>🕐 {shop.openHours}</dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex flex-col gap-1.5">
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  📍 เปิดแผนที่ Google Maps →
                </a>
              )}
              {shop.facebookUrl && (
                <a
                  href={shop.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Facebook ร้าน →
                </a>
              )}
            </div>
          </div>

          <ContactButtons phone={shop.phone} line={shop.lineId} />

          <p className="text-xs leading-relaxed text-muted-foreground">
            พบข้อมูลไม่ถูกต้อง?{" "}
            <Link href="/about" className="underline hover:text-primary">
              แจ้งทีมงาน
            </Link>{" "}
            เพื่อช่วยกันอัปเดตข้อมูลร้านให้ล่าสุด
          </p>
        </aside>
      </div>

      {nearbyListings.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold text-primary-dk">
              ประกาศขายในพื้นที่นี้
            </h2>
            <Link
              href={`/listings?province=${shop.province}`}
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {nearbyListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            บทความเกษตรที่เกี่ยวข้อง
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
