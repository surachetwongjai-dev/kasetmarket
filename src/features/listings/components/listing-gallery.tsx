"use client";

// Gallery รูปประกาศ — รูปใหญ่ + thumbnail แถวล่าง แตะสลับได้

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ListingGallery({
  images,
  title,
}: {
  // โครงสร้างขั้นต่ำ — ใช้ได้ทั้ง ListingImage และ ShopImage (directory Phase 1.5)
  images: { id: string; url: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-muted-foreground">
        ไม่มีรูป
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <Image
          src={images[active].url}
          alt={`${title} — รูปที่ ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`ดูรูปที่ ${i + 1}`}
              className={cn(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-primary" : "border-transparent",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
