// จัดการประกาศทุกสถานะ (M7): ค้นหา + ตั้ง/ถอดประกาศเด่น (featured)

import type { Metadata } from "next";
import Link from "next/link";
import { searchListingsForAdmin } from "@/features/moderation/queries";
import { toggleFeaturedAction } from "@/features/moderation/actions";
import { ListingStatusBadge } from "@/features/listings/components/listing-status-badge";

export const metadata: Metadata = {
  title: "จัดการประกาศ",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const listings = await searchListingsForAdmin(q?.trim() || undefined);

  return (
    <div className="flex flex-col gap-4">
      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อประกาศ"
          className="h-11 w-full max-w-sm rounded-lg border border-input bg-card px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          ค้นหา
        </button>
      </form>

      <p className="text-xs text-muted-foreground">
        ประกาศเด่นแสดงบนหน้าแรกและติดป้ายทองในหน้ารวม (แสดง 30 รายการล่าสุด —
        ใช้ช่องค้นหาเพื่อหาประกาศเก่า)
      </p>

      {listings.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">ไม่พบประกาศ</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5">
                  {listing.featured && (
                    <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
                      เด่น
                    </span>
                  )}
                  <Link
                    href={`/listings/${listing.slug}`}
                    target="_blank"
                    className="truncate font-medium hover:text-primary hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <ListingStatusBadge status={listing.status} />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {listing.province} · {listing.seller.name} ·{" "}
                  {listing.views.toLocaleString("th-TH")} วิว
                </p>
              </div>
              <form action={toggleFeaturedAction} className="shrink-0">
                <input type="hidden" name="id" value={listing.id} />
                <button
                  type="submit"
                  className={`flex h-10 items-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                    listing.featured
                      ? "border-border bg-background hover:bg-muted"
                      : "border-accent/60 text-accent-foreground hover:bg-accent/10"
                  }`}
                >
                  {listing.featured ? "ถอดประกาศเด่น" : "★ ตั้งเป็นประกาศเด่น"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
