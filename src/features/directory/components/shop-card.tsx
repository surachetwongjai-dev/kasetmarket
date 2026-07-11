// การ์ดร้านค้า — หน้าตาเดียวกับการ์ดประกาศ (รูป 4:3 → ชื่อ → หมวด → อำเภอ/จังหวัด)

import Link from "next/link";
import Image from "next/image";
import type { Shop, ShopImage } from "@prisma/client";
import { getShopCategory, getShopCategoryLabel } from "@/config/shopCategories";
import { shopPath } from "../paths";

export function ShopCard({
  shop,
}: {
  shop: Shop & { images: ShopImage[] };
}) {
  const primaryIcon = getShopCategory(shop.categories[0])?.icon ?? "🏪";

  return (
    <Link
      href={shopPath(shop)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {shop.images[0] ? (
          <Image
            src={shop.images[0].url}
            alt={shop.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center text-4xl"
          >
            {primaryIcon}
          </div>
        )}
        {shop.featured && (
          <span className="absolute top-2 left-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
            ร้านแนะนำ
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {shop.name}
        </p>
        <p className="line-clamp-1 text-xs text-primary">
          {shop.categories.map(getShopCategoryLabel).join(" · ")}
        </p>
        <p className="mt-auto text-xs text-muted-foreground">
          {shop.district ? `อ.${shop.district} · ` : ""}
          {shop.province}
        </p>
      </div>
    </Link>
  );
}
