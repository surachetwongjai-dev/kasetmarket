// "ป้ายราคาต่อหน่วย" — signature element (CLAUDE.md §3)
// ราคาใหญ่ + หน่วยเกษตรจริง ในกรอบสีทองข้าวเปลือก สิ่งแรกที่ผู้ซื้อมองหา

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { getUnitLabel } from "@/config/units";

export function PriceTag({
  price,
  unit,
  negotiable,
  size = "md",
}: {
  price: number;
  unit: string;
  negotiable?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-lg border border-accent/40 bg-accent/10 font-num font-bold text-accent-foreground",
        size === "lg" ? "px-3 py-1.5 text-2xl" : "px-2 py-0.5 text-base",
      )}
    >
      {formatPrice(price)}
      <span
        className={cn(
          "font-medium text-muted-foreground",
          size === "lg" ? "text-base" : "text-xs",
        )}
      >
        บาท/{getUnitLabel(unit)}
      </span>
      {negotiable && (
        <span
          className={cn(
            "font-normal text-muted-foreground",
            size === "lg" ? "text-sm" : "text-[10px]",
          )}
        >
          ต่อรองได้
        </span>
      )}
    </span>
  );
}
