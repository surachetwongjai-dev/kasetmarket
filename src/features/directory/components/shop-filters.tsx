// Filter หน้ารวมร้านค้า — form GET ธรรมดา ทำงานได้โดยไม่ต้องมี JS (แพทเทิร์นเดียวกับ ListingFilters)

import { SHOP_CATEGORIES } from "@/config/shopCategories";
import { PROVINCES, REGIONS } from "@/config/provinces";
import { DIRECTORY_BASE } from "../paths";

export type ShopSearchParams = {
  q?: string;
  category?: string;
  province?: string;
  page?: string;
};

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ShopFilters({ params }: { params: ShopSearchParams }) {
  return (
    <form
      method="GET"
      action={DIRECTORY_BASE}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      <input
        type="search"
        name="q"
        defaultValue={params.q}
        placeholder="ค้นหาชื่อร้าน"
        aria-label="ค้นหาร้านค้า"
        className={`${inputClass} col-span-2 sm:col-span-1`}
      />

      <select
        name="category"
        defaultValue={params.category ?? ""}
        aria-label="หมวดร้าน"
        className={selectClass}
      >
        <option value="">ทุกหมวด</option>
        {SHOP_CATEGORIES.map((c) => (
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

      <button
        type="submit"
        className="h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        ค้นหา
      </button>
    </form>
  );
}
