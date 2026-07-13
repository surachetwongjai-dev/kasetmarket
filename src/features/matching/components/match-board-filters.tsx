// Filter กระดานจับคู่ (B2) — form GET ทำงานได้ไม่ต้องมี JS · action ชี้ URL ไทย
// type ส่งผ่าน hidden (คุมด้วยแท็บ) เพื่อคงแท็บที่เลือกไว้ตอนกดค้นหา

import { CATEGORIES } from "@/config/categories";
import { PROVINCES, REGIONS } from "@/config/provinces";
import { MATCHING_BASE, type MatchBoardParams } from "../paths";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function MatchBoardFilters({ params }: { params: MatchBoardParams }) {
  return (
    <form
      method="GET"
      action={MATCHING_BASE}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      <input type="hidden" name="type" value={params.type ?? "SUPPLY"} />

      <select
        name="category"
        defaultValue={params.category ?? ""}
        aria-label="หมวดหมู่"
        className={selectClass}
      >
        <option value="">ทุกหมวด</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        name="province"
        defaultValue={params.province ?? ""}
        aria-label="จังหวัด"
        className={selectClass}
      >
        <option value="">ทุกจังหวัด</option>
        {REGIONS.map((region) => (
          <optgroup key={region} label={`ภาค${region}`}>
            {PROVINCES.filter((p) => p.region === region).map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={params.sort ?? "newest"}
        aria-label="เรียงตาม"
        className={selectClass}
      >
        <option value="newest">ใหม่สุด</option>
        <option value="nearest">ใกล้ถึงกำหนด</option>
      </select>

      <button
        type="submit"
        className="h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        ค้นหา
      </button>
    </form>
  );
}
