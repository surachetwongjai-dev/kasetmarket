// กราฟเส้นราคาย้อนหลังแบบ SVG เขียนเอง (ไม่ใช้ chart lib — PLAN-PHASE2 §3)
// values เรียงเก่า→ใหม่

export function PriceSparkline({
  values,
  width = 280,
  height = 56,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 5;
  const stepX = (width - pad * 2) / (values.length - 1);

  const point = (v: number, i: number): [number, number] => [
    pad + i * stepX,
    pad + (height - pad * 2) * (1 - (v - min) / range),
  ];
  const pts = values.map(point);
  const [lastX, lastY] = pts[pts.length - 1];

  // ขึ้น = เขียว, ลง = แดง (เทียบหัว-ท้าย)
  const up = values[values.length - 1] >= values[0];
  const color = up ? "#1E7A46" : "#C0392B";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="กราฟราคาย้อนหลัง"
      className="max-w-full"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
      />
      <circle cx={lastX.toFixed(1)} cy={lastY.toFixed(1)} r="3" fill={color} />
    </svg>
  );
}
