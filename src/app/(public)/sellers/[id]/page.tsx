// โปรไฟล์ผู้ขาย — ประกาศ ACTIVE ทั้งหมด + badge ยืนยัน (M9) + รีวิวผู้ขาย (T2)
// dynamic: ต้องรู้ผู้ชม (auth) เพื่อแสดงฟอร์มรีวิว/ตอบกลับตามสิทธิ์

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSellerProfile,
  getSellerActiveListings,
} from "@/features/listings/queries";
import { ListingCard } from "@/features/listings/components/listing-card";
import { auth } from "@/features/auth";
import { FLAGS } from "@/config/flags";
import {
  RatingStars,
  ReviewSection,
  getSellerRatingSummary,
  getSellerReviews,
  getReviewEligibility,
} from "@/features/trust";
import {
  FarmProfileSection,
  hasFarmContent,
  getFarmProfile,
} from "@/features/profile";
import { formatThaiDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSellerProfile(id);
  if (!seller) return { title: "ไม่พบผู้ขาย" };
  return {
    title: `${seller.name} — ประกาศขายสินค้าเกษตร`,
    description: `ประกาศขายสินค้าเกษตรทั้งหมดจาก ${seller.name}${seller.province ? ` จังหวัด${seller.province}` : ""} บน TaladKaset`,
    alternates: { canonical: `/sellers/${id}` },
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const { id } = await params;
  const seller = await getSellerProfile(id);
  if (!seller) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const isSeller = viewerId === seller.id;

  const [listings, review, farm] = await Promise.all([
    getSellerActiveListings(id),
    FLAGS.REVIEWS
      ? Promise.all([
          getSellerRatingSummary(id),
          getSellerReviews(id),
          getReviewEligibility(id, viewerId),
        ]).then(([summary, reviews, eligibility]) => ({
          summary,
          reviews,
          eligibility,
        }))
      : Promise.resolve(null),
    FLAGS.FARM_PROFILE ? getFarmProfile(id) : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <header className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted sm:size-20">
          {seller.image ? (
            <Image
              src={seller.image}
              alt={seller.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">
              👤
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
            {seller.name}
            {seller.verified && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                ✓ ยืนยันตัวตนแล้ว
              </span>
            )}
          </h1>
          {review && review.summary.count > 0 && (
            <Link href="#reviews" className="mt-1 inline-block">
              <RatingStars
                rating={review.summary.avg}
                count={review.summary.count}
                size="lg"
              />
            </Link>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {seller.province ? `📍 ${seller.province} · ` : ""}
            สมาชิกตั้งแต่ {formatThaiDate(seller.createdAt)} · ประกาศที่กำลังขาย{" "}
            {listings.length} รายการ
          </p>
        </div>
      </header>

      {hasFarmContent(farm) && (
        <FarmProfileSection profile={farm} sellerName={seller.name} />
      )}

      <h2 className="mt-8 font-heading text-lg font-semibold text-primary-dk">
        กำลังขายตอนนี้
      </h2>
      {listings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          ผู้ขายรายนี้ยังไม่มีประกาศที่กำลังขาย
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {review && (
        <div id="reviews" className="scroll-mt-4">
          <ReviewSection
            sellerId={seller.id}
            isSeller={isSeller}
            summary={review.summary}
            reviews={review.reviews}
            eligibility={review.eligibility}
          />
        </div>
      )}
    </main>
  );
}
