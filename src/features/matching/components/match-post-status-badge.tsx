import type { MatchPostStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  MatchPostStatus,
  { label: string; className: string }
> = {
  ACTIVE: { label: "แสดงบนกระดาน", className: "bg-primary/10 text-primary" },
  PENDING: { label: "รออนุมัติ", className: "bg-accent/15 text-accent-foreground" },
  MATCHED: { label: "จับคู่แล้ว", className: "bg-muted text-muted-foreground" },
  EXPIRED: { label: "หมดอายุ", className: "bg-muted text-muted-foreground" },
  REJECTED: { label: "ถูกปฏิเสธ", className: "bg-destructive/10 text-destructive" },
};

export function MatchPostStatusBadge({ status }: { status: MatchPostStatus }) {
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
