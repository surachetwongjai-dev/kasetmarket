// หน้าจังหวัด×หมวด — หน้าดัก local SEO หลัก เช่น "ร้านขายปุ๋ย นครสวรรค์" — ISR 1 ชม. (CLAUDE.md §10)
// หมวด slug ไม่รู้จัก หรือไม่มีร้านเลย → 404 (กัน thin/empty page)

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getShopsByProvinceCategory,
  getArticlesForListingCategories,
} from "@/features/directory/queries";
import { ShopCard } from "@/features/directory/components/shop-card";
import { ArticleCard } from "@/features/articles/components/article-card";
import { getCategoryLabel } from "@/config/categories";
import {
  DIRECTORY_BASE,
  provincePath,
  categoryPath,
} from "@/features/directory/paths";
import { shopCategoryBySlug } from "@/config/shopCategories";
import { PROVINCES } from "@/config/provinces";

export const revalidate = 3600;

type Props = { params: Promise<{ province: string; category: string }> };

async function resolveParams({ params }: Props) {
  const raw = await params;
  const province = decodeURIComponent(raw.province);
  const category = shopCategoryBySlug(decodeURIComponent(raw.category));
  if (!PROVINCES.some((p) => p.name === province) || !category) notFound();
  return { province, category };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { province, category } = await resolveParams(props);
  // title pattern ตาม CLAUDE.md §10
  return {
    title: `ร้าน${category.label} ${province} — รวมร้านค้า ตัวแทนจำหน่าย พร้อมเบอร์โทร`,
    description: `รวมร้าน${category.label}ใน จ.${province} พร้อมเบอร์โทร ที่อยู่ เวลาเปิด ติดต่อร้านได้โดยตรง`,
    alternates: { canonical: categoryPath(province, category.slug) },
  };
}

export default async function CategoryDirectoryPage(props: Props) {
  const { province, category } = await resolveParams(props);

  const shops = await getShopsByProvinceCategory(province, category.value);
  if (shops.length === 0) notFound();

  // cross-link (D3): บทความหมวดที่ map กับหมวดประกาศของหมวดร้านนี้
  const relatedArticles = await getArticlesForListingCategories(
    category.listingCategories,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <nav className="text-sm text-muted-foreground">
        <Link href={DIRECTORY_BASE} className="hover:text-primary hover:underline">
          ร้านค้าเกษตร
        </Link>
        {" › "}
        <Link
          href={provincePath(province)}
          className="hover:text-primary hover:underline"
        >
          {province}
        </Link>
        {" › "}
        <span>{category.label}</span>
      </nav>

      <h1 className="mt-2 font-heading text-xl font-bold text-primary-dk sm:text-2xl">
        ร้าน{category.label} จ.{province}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {shops.length.toLocaleString("th-TH")} ร้าน · อัปเดตข้อมูลโดยทีมงานและเจ้าของร้าน
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {/* cross-link (D3): ไปหมวดประกาศที่เกี่ยวข้องในจังหวัดเดียวกัน */}
      <section className="mt-8 rounded-xl border border-border bg-card p-4">
        <h2 className="font-heading font-semibold">
          กำลังหาซื้อ-ขายสินค้าเกษตรใน จ.{province}?
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {category.listingCategories.map((value) => (
            <Link
              key={value}
              href={`/listings?category=${value}&province=${province}`}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              ประกาศ{getCategoryLabel(value)} จ.{province} →
            </Link>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="mt-8">
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
