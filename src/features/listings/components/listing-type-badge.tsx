// ป้ายประเภทประกาศ ขาย/ต้องการซื้อ — ใช้ทั้งการ์ด, หน้าประกาศ, dashboard
// สี/ข้อความมาจาก config/listingTypes.ts ที่เดียว

import { cn } from "@/lib/utils";
import { listingTypeMeta } from "@/config/listingTypes";

export function ListingTypeBadge({
  type,
  size = "md",
  className,
}: {
  type: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = listingTypeMeta(type);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "lg"
          ? "px-3 py-1 text-sm"
          : size === "sm"
            ? "px-2 py-0.5 text-[11px]"
            : "px-2.5 py-0.5 text-xs",
        meta.badgeClass,
        className,
      )}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
