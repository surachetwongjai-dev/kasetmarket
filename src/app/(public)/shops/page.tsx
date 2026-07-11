// หน้ารวมร้านค้า directory + ค้นหา/filter — Server Component dynamic (CLAUDE.md §10)

import type { Metadata } from "next";
import Link from "next/link";
import {
  searchShops,
  getProvincesWithShopCounts,
  type ShopSearchQuery,
} from "@/features/directory/queries";
import { ShopCard } from "@/features/directory/components/shop-card";
import {
  ShopFilters,
  type ShopSearchParams,
} from "@/features/directory/components/shop-filters";
import { ShopPagination } from "@/features/directory/components/shop-pagination";
import { DIRECTORY_BASE, provincePath } from "@/features/directory/paths";
import { getShopCategoryLabel } from "@/config/shopCategories";

export const metadata: Metadata = {
  title: "ร้านค้า-ตัวแทนจำหน่ายเกษตรทั่วไทย", // layout เติม "| KasetMarket" ให้
  description:
    "รวมร้านขายปุ๋ย เมล็ดพันธุ์ เครื่องจักรกลเกษตร และจุดรับซื้อผลผลิตทั่วไทย พร้อมเบอร์โทร ที่อยู่ เวลาเปิด ค้นหาร้านเกษตรใกล้บ้านคุณ",
  // canonical ชี้ base เสมอ — รวม filter param ให้เป็นหน้าเดียว กัน duplicate content
  alternates: { canonical: DIRECTORY_BASE },
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;

  const query: ShopSearchQuery = {
    q: params.q?.trim() || undefined,
    category: params.category || undefined,
    province: params.province || undefined,
    page: Math.max(1, Number(params.page) || 1),
  };
  const hasFilter = Boolean(query.q || query.category || query.province);

  const [{ items, total, page, totalPages }, provinces] = await Promise.all([
    searchShops(query),
    getProvincesWithShopCounts(),
  ]);

  const headline = [
    "ร้านค้า-ตัวแทนจำหน่ายเกษตร",
    query.category ? `หมวด${getShopCategoryLabel(query.category)}` : null,
    query.province ? `จ.${query.province}` : null,
    query.q ? `ค้นหา "${query.q}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="font-heading text-xl font-bold text-primary-dk sm:text-2xl">
        {headline}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        พบ {total.toLocaleString("th-TH")} ร้าน
      </p>

      <div className="mt-4">
        <ShopFilters params={params} />
      </div>

      {/* เลือกดูตามจังหวัด (เฉพาะตอนยังไม่ filter — ทางเข้าหน้า SEO รายจังหวัด) */}
      {!hasFilter && provinces.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-medium text-muted-foreground">
            เลือกดูตามจังหวัด
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {provinces.map(({ province, count }) => (
              <Link
                key={province}
                href={provincePath(province)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {province}{" "}
                <span className="text-muted-foreground">({count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ไม่พบร้านที่ตรงกับเงื่อนไข — ลองเปลี่ยนคำค้นหรือลด filter ดู
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <ShopPagination page={page} totalPages={totalPages} params={params} />
      </div>
    </main>
  );
}
