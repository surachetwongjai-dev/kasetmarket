"use client";

// เครื่องคิดค่าส่งฝั่ง client (S1) — กรอกน้ำหนัก + ขนาด (optional) → เรียงถูก→แพง
// คำนวณสด ไม่เรียก API (ตรรกะจาก features/shipping/calc.ts)

import { useMemo, useState } from "react";
import { quoteAll, type Dimensions } from "../calc";

function parseNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatBaht(n: number): string {
  return n.toLocaleString("th-TH");
}

export function ShippingCalculator() {
  const [weight, setWeight] = useState("2");
  const [showDims, setShowDims] = useState(false);
  const [w, setW] = useState("");
  const [l, setL] = useState("");
  const [h, setH] = useState("");

  const actualKg = parseNum(weight);
  const dims: Dimensions | null = useMemo(() => {
    if (!showDims) return null;
    const dw = parseNum(w),
      dl = parseNum(l),
      dh = parseNum(h);
    return dw && dl && dh ? { w: dw, l: dl, h: dh } : null;
  }, [showDims, w, l, h]);

  const rows = useMemo(
    () => (actualKg > 0 ? quoteAll(actualKg, dims) : []),
    [actualKg, dims],
  );

  const anyVolumetric = rows.some((r) => r.volumetric && r.price != null);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      {/* ฟอร์มกรอก */}
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="ship-weight"
            className="block text-sm font-medium text-foreground"
          >
            น้ำหนักพัสดุ (กิโลกรัม)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              id="ship-weight"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 w-32 rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span className="text-sm text-muted-foreground">กก.</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowDims((v) => !v)}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {showDims ? "− ซ่อนขนาดกล่อง" : "+ ระบุขนาดกล่อง (ถ้ากล่องใหญ่แต่เบา)"}
          </button>
          {showDims && (
            <div className="mt-3">
              <div className="flex flex-wrap items-end gap-2">
                {[
                  { id: "dim-w", label: "กว้าง", val: w, set: setW },
                  { id: "dim-l", label: "ยาว", val: l, set: setL },
                  { id: "dim-h", label: "สูง", val: h, set: setH },
                ].map((d) => (
                  <div key={d.id}>
                    <label
                      htmlFor={d.id}
                      className="block text-xs text-muted-foreground"
                    >
                      {d.label} (ซม.)
                    </label>
                    <input
                      id={d.id}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={d.val}
                      onChange={(e) => d.set(e.target.value)}
                      className="mt-1 h-11 w-20 rounded-lg border border-input bg-background px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                ค่ายส่วนใหญ่คิดน้ำหนักตามปริมาตร (ก×ย×ส ÷ 5000) เทียบกับน้ำหนักจริง
                แล้วใช้ค่าที่มากกว่า
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ผลลัพธ์ */}
      {rows.length > 0 ? (
        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-heading text-base font-semibold text-primary-dk">
              ค่าส่งโดยประมาณ
            </h2>
            {anyVolumetric && (
              <span className="text-xs text-muted-foreground">
                * บางค่ายคิดตามน้ำหนักปริมาตร
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <li
                key={`${r.carrier.slug}-${r.service.id}`}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                  i === 0 && r.price != null
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-medium text-foreground">
                    <span>{r.carrier.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      · {r.service.label}
                    </span>
                    {i === 0 && r.price != null && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        ถูกสุด
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.service.fresh && (
                      <Badge>🍎 รับของสด/ผลไม้</Badge>
                    )}
                    {r.carrier.coldChain && <Badge>❄️ ห้องเย็น</Badge>}
                    {r.carrier.codSupport && <Badge>COD ✓</Badge>}
                    {r.volumetric && r.price != null && (
                      <Badge>คิด {r.chargeableKg.toFixed(1)} กก.*</Badge>
                    )}
                  </div>
                  {r.service.note && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.service.note}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {r.price != null ? (
                    <p className="font-num text-lg font-bold text-accent-gold-foreground">
                      ≈ {formatBaht(r.price)}฿
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">เกินพิกัด</p>
                  )}
                  <a
                    href={r.carrier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    เช็คเรทจริง →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          กรอกน้ำหนักพัสดุเพื่อดูค่าส่งโดยประมาณของแต่ละค่าย
        </p>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}
