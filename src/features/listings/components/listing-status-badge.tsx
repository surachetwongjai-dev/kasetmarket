import type { ListingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> =
  {
    ACTIVE: { label: "กำลังขาย", className: "bg-primary/10 text-primary" },
    PENDING: { label: "รออนุมัติ", className: "bg-accent/15 text-accent-foreground" },
    SOLD: { label: "ขายแล้ว", className: "bg-muted text-muted-foreground" },
    EXPIRED: { label: "หมดอายุ", className: "bg-muted text-muted-foreground" },
    REJECTED: { label: "ถูกปฏิเสธ", className: "bg-destructive/10 text-destructive" },
  };

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
