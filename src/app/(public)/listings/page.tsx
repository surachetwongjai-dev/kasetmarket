// หน้ารวมประกาศ + ค้นหา/filter — Server Component dynamic (filter ผ่าน searchParams)

import type { Metadata } from "next";
import {
  getPublicListings,
  type PublicListingsParams,
} from "@/features/listings/queries";
import { ListingCard } from "@/features/listings/components/listing-card";
import {
  ListingFilters,
  type ListingSearchParams,
} from "@/features/listings/components/listing-filters";
import { ListingPagination } from "@/features/listings/components/listing-pagination";
import { getCategoryLabel } from "@/config/categories";

export const metadata: Metadata = {
  title: "ประกาศขายสินค้าเกษตร", // layout เติม "| KasetMarket" ให้

  description:
    "รวมประกาศขายสินค้าเกษตรทั่วไทย ข้าว ผัก ผลไม้ ปุ๋ย เครื่องจักร ที่ดิน ติดต่อผู้ขายตรง ไม่ผ่านคนกลาง",
  // canonical ชี้ base เสมอ — รวม filter param (?category=/?province=/?q=/?page=) ให้เป็นหน้าเดียว กัน duplicate content
  alternates: { canonical: "/listings" },
};

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;

  const query: PublicListingsParams = {
    q: params.q?.trim() || undefined,
    category: params.category || undefined,
    province: params.province || undefined,
    minPrice: toNumber(params.minPrice),
    maxPrice: toNumber(params.maxPrice),
    sort: params.sort === "cheapest" ? "cheapest" : "newest",
    page: Math.max(1, Number(params.page) || 1),
  };

  const { items, total, page, totalPages } = await getPublicListings(query);

  const headline = [
    "ประกาศขายสินค้าเกษตร",
    query.category ? `หมวด${getCategoryLabel(query.category)}` : null,
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
        พบ {total.toLocaleString("th-TH")} ประกาศ
      </p>

      <div className="mt-4">
        <ListingFilters params={params} />
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ไม่พบประกาศที่ตรงกับเงื่อนไข — ลองเปลี่ยนคำค้นหรือลด filter ดู
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <ListingPagination page={page} totalPages={totalPages} params={params} />
      </div>
    </main>
  );
}
