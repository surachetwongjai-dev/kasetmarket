// ประกาศของฉัน — จัดการครบวงจร (M5)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { getMyListings } from "@/features/listings/queries";
import { ListingRowActions } from "@/features/listings/components/listing-row-actions";
import { ListingStatusBadge } from "@/features/listings/components/listing-status-badge";
import { formatPricePerUnit, formatThaiDate, formatTimeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "ประกาศของฉัน",
};

const NOTICES: Record<string, string> = {
  active: "ลงประกาศสำเร็จ! ประกาศของคุณแสดงบนเว็บแล้ว",
  pending:
    "ลงประกาศสำเร็จ! ประกาศอยู่ระหว่างรอแอดมินตรวจสอบ (ปกติไม่เกิน 1 วัน) — ผ่านแล้วจะแสดงบนเว็บทันที",
};

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { created, updated } = await searchParams;
  const notice = created ? NOTICES[created] : updated ? "บันทึกการแก้ไขแล้ว" : null;

  const listings = await getMyListings(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary-dk">
          ประกาศของฉัน
        </h1>
        <Link
          href="/dashboard/listings/new"
          className="flex h-11 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + ลงประกาศใหม่
        </Link>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary-dk">
          {notice}
        </p>
      )}

      {listings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          ยังไม่มีประกาศ — กด &quot;ลงประกาศใหม่&quot; เพื่อเริ่มขายเลย
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex gap-3">
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-32">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      ไม่มีรูป
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 font-medium">{listing.title}</p>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <p className="mt-1 font-num text-lg font-bold text-accent-foreground">
                    {formatPricePerUnit(Number(listing.price), listing.unit)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {listing.province} · ลงเมื่อ {formatTimeAgo(listing.createdAt)} ·{" "}
                    {listing.views.toLocaleString("th-TH")} วิว · หมดอายุ{" "}
                    {formatThaiDate(listing.expiresAt)}
                  </p>
                </div>
              </div>
              {listing.status === "REJECTED" && listing.rejectReason && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  เหตุผลที่ไม่ผ่าน: {listing.rejectReason} — แก้ไขประกาศแล้วระบบจะส่งเข้าคิวตรวจใหม่
                </p>
              )}
              <ListingRowActions id={listing.id} status={listing.status} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
