// จัดการร้านค้า directory (D5) — คิว PENDING บนสุด + รายการร้านทั้งหมด (featured/แก้ไข)
// แพทเทิร์นเดียวกับ /admin/moderation (M7)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getPendingShops,
  getAllShopsForAdmin,
} from "@/features/directory/queries";
import {
  ShopModerationActions,
  ShopFeaturedToggle,
} from "@/features/directory/components/shop-admin-actions";
import { getShopCategoryLabel } from "@/config/shopCategories";
import { formatThaiDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "จัดการร้านค้า directory",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอตรวจ", className: "bg-accent/15 text-accent-foreground" },
  APPROVED: { label: "เผยแพร่", className: "bg-primary/10 text-primary" },
  REJECTED: { label: "ปฏิเสธ", className: "bg-destructive/10 text-destructive" },
};

export default async function AdminShopsPage() {
  const [pending, all] = await Promise.all([
    getPendingShops(),
    getAllShopsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="font-heading text-lg font-semibold">
          คิวร้านรอตรวจ ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            🎉 ไม่มีร้านรอตรวจ
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {pending.map((shop) => (
              <article
                key={shop.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <h3 className="font-medium">{shop.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {shop.categories.map(getShopCategoryLabel).join(" · ")} ·{" "}
                    {shop.district ? `อ.${shop.district} ` : ""}จ.{shop.province}{" "}
                    · ส่งเมื่อ {formatThaiDateTime(shop.createdAt)}
                  </p>
                </div>

                {shop.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {shop.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-lg bg-muted"
                      >
                        <Image
                          src={img.url}
                          alt=""
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                  {shop.description}
                </p>

                <p className="text-xs text-muted-foreground">
                  ติดต่อ: {[shop.phone, shop.lineId].filter(Boolean).join(" / ") || "—"}
                  {shop.address ? ` · ที่อยู่: ${shop.address}` : ""}
                  {shop.openHours ? ` · เปิด: ${shop.openHours}` : ""}
                  {shop.facebookUrl ? ` · FB: ${shop.facebookUrl}` : ""}
                </p>

                <div className="flex flex-col gap-2">
                  <ShopModerationActions shopId={shop.id} />
                  <Link
                    href={`/admin/shops/${shop.id}/edit`}
                    className="text-center text-sm font-medium text-primary hover:underline"
                  >
                    แก้ข้อมูลก่อนอนุมัติ →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold">
          ร้านทั้งหมด ({all.length})
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {all.map((shop) => {
            const badge = STATUS_BADGE[shop.status];
            return (
              <div
                key={shop.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {shop.name}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {shop.categories.map(getShopCategoryLabel).join(" · ")} · จ.
                    {shop.province}
                  </p>
                </div>
                {shop.status === "APPROVED" && (
                  <ShopFeaturedToggle shopId={shop.id} featured={shop.featured} />
                )}
                <Link
                  href={`/admin/shops/${shop.id}/edit`}
                  className="flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  แก้ไข
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
