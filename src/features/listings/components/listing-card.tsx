// การ์ดประกาศ: รูป 4:3 → ชื่อ → ป้ายราคา/หน่วย → จังหวัด + เวลาโพส (CLAUDE.md §3)
// ใช้ทั้งหน้ารวมประกาศ, ประกาศใกล้เคียง, หน้าแรก (M9)

import Link from "next/link";
import Image from "next/image";
import type { Listing, ListingImage } from "@prisma/client";
import { formatTimeAgo } from "@/lib/format";
import { PriceTag } from "./price-tag";

export function ListingCard({
  listing,
}: {
  listing: Listing & { images: ListingImage[] };
}) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {listing.images[0] ? (
          <Image
            src={listing.images[0].url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            ไม่มีรูป
          </div>
        )}
        {listing.featured && (
          <span className="absolute top-2 left-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
            ประกาศเด่น
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {listing.title}
        </p>
        <PriceTag
          price={Number(listing.price)}
          unit={listing.unit}
          negotiable={listing.negotiable}
        />
        <p className="mt-auto text-xs text-muted-foreground">
          {listing.province} · {formatTimeAgo(listing.createdAt)}
        </p>
      </div>
    </Link>
  );
}
