// แสดงดาวรีวิว (อ่านอย่างเดียว) — ดาวเต็มตาม Math.round + ตัวเลขเฉลี่ย + จำนวน
// ไม่มี hook → ใช้ได้ทั้ง server/client

export function RatingStars({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "lg";
}) {
  const textCls = size === "lg" ? "text-base" : "text-sm";

  if (count === 0) {
    return (
      <span className={`${textCls} text-muted-foreground`}>ยังไม่มีรีวิว</span>
    );
  }

  const filled = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${textCls}`}
      aria-label={`${rating.toFixed(1)} จาก 5 ดาว`}
    >
      <span aria-hidden className="text-accent-gold">
        {"★★★★★".slice(0, filled)}
        <span className="text-muted-foreground/40">{"★★★★★".slice(filled)}</span>
      </span>
      <span className="font-num font-semibold text-foreground">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground">
          ({count.toLocaleString("th-TH")} รีวิว)
        </span>
      )}
    </span>
  );
}
