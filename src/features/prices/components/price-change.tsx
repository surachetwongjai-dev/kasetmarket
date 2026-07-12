// ลูกศรเปลี่ยนแปลงราคาเทียบครั้งก่อน — ▲เขียว/▼แดง/— (PLAN-PHASE2 §3)

import { formatDiff, type ChangeDir } from "../format";

export function PriceChange({
  change,
}: {
  change: { dir: ChangeDir; diff: number } | null;
}) {
  if (!change || change.dir === "same") {
    return <span className="text-muted-foreground">—</span>;
  }
  const up = change.dir === "up";
  return (
    <span
      className={`font-num font-medium ${up ? "text-primary" : "text-destructive"}`}
    >
      {up ? "▲" : "▼"} {formatDiff(change.diff)}
    </span>
  );
}
