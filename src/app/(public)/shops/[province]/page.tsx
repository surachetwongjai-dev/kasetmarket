// หน้า directory รายจังหวัด — ISR 1 ชม. (CLAUDE.md §10)
// จังหวัดที่ไม่มีร้าน APPROVED เลย → 404 (กัน thin/empty page)

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getShopsByProvince,
  getCategoryCountsInProvince,
} from "@/features/directory/queries";
import { ShopCard } from "@/features/directory/components/shop-card";
import {
  DIRECTORY_BASE,
  provincePath,
  categoryPath,
} from "@/features/directory/paths";
import { breadcrumbJsonLd, provinceContent } from "@/features/directory/seo";
import { SHOP_CATEGORIES } from "@/config/shopCategories";
import { PROVINCES } from "@/config/provinces";

export const revalidate = 3600;

type Props = { params: Promise<{ province: string }> };

function isProvince(name: string): boolean {
  return PROVINCES.some((p) => p.name === name);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const province = decodeURIComponent((await params).province);
  if (!isProvince(province)) notFound();
  return {
    title: `ร้านค้าเกษตร ${province} — รวมร้านค้า ตัวแทนจำหน่าย พร้อมเบอร์โทร`,
    description: `รวมร้านขายปุ๋ย เมล็ดพันธุ์ เครื่องจักรกลเกษตร และจุดรับซื้อผลผลิตใน จ.${province} พร้อมเบอร์โทร ที่อยู่ เวลาเปิด`,
    alternates: { canonical: provincePath(province) },
  };
}

export default async function ProvinceDirectoryPage({ params }: Props) {
  const province = decodeURIComponent((await params).province);
  if (!isProvince(province)) notFound();

  const [shops, categoryCounts] = await Promise.all([
    getShopsByProvince(province),
    getCategoryCountsInProvince(province),
  ]);
  if (shops.length === 0) notFound();

  const categoriesHere = SHOP_CATEGORIES.filter((c) =>
    categoryCounts.has(c.value),
  );

  // ข้อมูลจริงประกอบย่อหน้าคอนเทนต์ + breadcrumb JSON-LD (D4)
  const districts = [
    ...new Set(shops.map((s) => s.district).filter((d): d is string => !!d)),
  ];
  const paragraphs = provinceContent({
    province,
    shopCount: shops.length,
    categoriesHere: categoriesHere.map((category) => ({
      category,
      count: categoryCounts.get(category.value) ?? 0,
    })),
    districts,
  });
  const jsonLd = breadcrumbJsonLd([
    { name: "ร้านค้าเกษตร", path: DIRECTORY_BASE },
    { name: province, path: provincePath(province) },
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-muted-foreground">
        <Link href={DIRECTORY_BASE} className="hover:text-primary hover:underline">
          ร้านค้าเกษตร
        </Link>
        {" › "}
        <span>{province}</span>
      </nav>

      <h1 className="mt-2 font-heading text-xl font-bold text-primary-dk sm:text-2xl">
        ร้านค้า-ตัวแทนจำหน่ายเกษตร จ.{province}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {shops.length.toLocaleString("th-TH")} ร้านในจังหวัดนี้
      </p>

      {/* หมวดที่มีร้านในจังหวัด — ทางเข้าหน้าดัก keyword หลัก */}
      <div className="mt-4 flex flex-wrap gap-2">
        {categoriesHere.map((c) => (
          <Link
            key={c.value}
            href={categoryPath(province, c.slug)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            {c.icon} {c.label}{" "}
            <span className="text-muted-foreground">
              ({categoryCounts.get(c.value)})
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {/* ย่อหน้าคอนเทนต์จากข้อมูลจริง ≥150 คำ (D4 — กัน thin content) */}
      <section className="mt-8 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>
    </main>
  );
}
