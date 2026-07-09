// หน้าประกาศรายตัว — ISR 300s + on-demand revalidate เมื่อผู้ขายแก้ (M5 actions)
// JSON-LD Product/Offer + OG meta ตาม SEO strategy (CLAUDE.md §9)

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveListingBySlug,
  getRelatedListings,
} from "@/features/listings/queries";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ListingGallery } from "@/features/listings/components/listing-gallery";
import { ContactButtons } from "@/features/listings/components/contact-buttons";
import { PriceTag } from "@/features/listings/components/price-tag";
import { ViewTracker } from "@/features/listings/components/view-tracker";
import { ReportButton } from "@/features/moderation/components/report-button";
import { getCategoryLabel } from "@/config/categories";
import { getUnitLabel } from "@/config/units";
import { formatPrice, formatThaiDate, formatTimeAgo } from "@/lib/format";

// [BISECT TEST] revalidate ถอดชั่วคราว

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getActiveListingBySlug(decodeURIComponent(slug));
  if (!listing) notFound();

  // title pattern §9: "ขาย{สินค้า} {จังหวัด} ราคา{ราคา} บาท/{หน่วย}"
  const title = `${listing.title} ${listing.province} ราคา ${formatPrice(Number(listing.price))} บาท/${getUnitLabel(listing.unit)}`;
  const description = listing.description.slice(0, 160);

  return {
    title, // layout เติม "| KasetMarket" ให้จาก title.template
    description,
    alternates: { canonical: `/listings/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "KasetMarket",
      images: listing.images[0] ? [{ url: listing.images[0].url }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getActiveListingBySlug(decodeURIComponent(slug));
  if (!listing) notFound();

  const related = await getRelatedListings(listing);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: "THB",
      availability: "https://schema.org/InStock",
      areaServed: listing.province,
    },
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker
        endpoint={`/api/listings/${listing.id}/view`}
        dedupeKey={`listing:${listing.id}`}
      />

      {/* breadcrumb แบบง่าย */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/listings" className="hover:text-primary hover:underline">
          ประกาศขาย
        </Link>
        {" › "}
        <Link
          href={`/listings?category=${listing.category}`}
          className="hover:text-primary hover:underline"
        >
          {getCategoryLabel(listing.category)}
        </Link>
      </nav>

      <div className="mt-3 grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <ListingGallery images={listing.images} title={listing.title} />

          <h1 className="mt-4 font-heading text-xl font-bold text-foreground sm:text-2xl">
            {listing.title}
          </h1>

          <div className="mt-2">
            <PriceTag
              price={Number(listing.price)}
              unit={listing.unit}
              negotiable={listing.negotiable}
              size="lg"
            />
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            📍 {listing.province}
            {listing.district ? ` · ${listing.district}` : ""} · ลงประกาศ{" "}
            {formatTimeAgo(listing.createdAt)} ·{" "}
            {listing.views.toLocaleString("th-TH")} วิว
          </p>

          <section className="mt-5">
            <h2 className="font-heading text-lg font-semibold">รายละเอียด</h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
              {listing.description}
            </p>
          </section>

          <div className="mt-5">
            <ReportButton listingId={listing.id} />
          </div>
        </div>

        {/* ข้อมูลผู้ขาย + ปุ่มติดต่อ (desktop: sidebar / mobile: sticky ล่าง) */}
        <aside className="flex flex-col gap-3">
          <Link
            href={`/sellers/${listing.seller.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <h2 className="text-sm font-medium text-muted-foreground">ผู้ขาย</h2>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              {listing.seller.name}
              {listing.seller.verified && (
                <span
                  title="ยืนยันตัวตนแล้ว"
                  className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                >
                  ✓ ยืนยันแล้ว
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {listing.seller.province ? `${listing.seller.province} · ` : ""}
              สมาชิกตั้งแต่ {formatThaiDate(listing.seller.createdAt)}
            </p>
            <p className="mt-1.5 text-xs font-medium text-primary">
              ดูประกาศทั้งหมดของผู้ขาย →
            </p>
          </Link>

          <ContactButtons
            phone={listing.contactPhone}
            line={listing.contactLine}
          />

          <p className="text-xs leading-relaxed text-muted-foreground">
            ⚠️ เพื่อความปลอดภัย: นัดดูสินค้าก่อนโอน อย่าโอนมัดจำให้คนที่ไม่เคยเจอ
            และตรวจสินค้าให้ดีก่อนจ่ายเงิน
          </p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            ประกาศใกล้เคียง
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
