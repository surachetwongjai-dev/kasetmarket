// Filter หน้ารวมประกาศ — form GET ธรรมดา ทำงานได้โดยไม่ต้องมี JS (เน็ตช้า/เครื่องเก่า)

import { CATEGORIES } from "@/config/categories";
import { PROVINCES, REGIONS } from "@/config/provinces";

export type ListingSearchParams = {
  q?: string;
  category?: string;
  province?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
};

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ListingFilters({ params }: { params: ListingSearchParams }) {
  return (
    <form
      method="GET"
      action="/listings"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
    >
      <input
        type="search"
        name="q"
        defaultValue={params.q}
        placeholder="ค้นหา เช่น ข้าวหอมมะลิ"
        aria-label="ค้นหาประกาศ"
        className={`${inputClass} col-span-2 sm:col-span-3 lg:col-span-2`}
      />

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

      <div className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
        <input
          type="number"
          name="minPrice"
          defaultValue={params.minPrice}
          placeholder="ราคาต่ำสุด"
          min="0"
          inputMode="numeric"
          aria-label="ราคาต่ำสุด"
          className={inputClass}
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          name="maxPrice"
          defaultValue={params.maxPrice}
          placeholder="สูงสุด"
          min="0"
          inputMode="numeric"
          aria-label="ราคาสูงสุด"
          className={inputClass}
        />
      </div>

      <div className="col-span-2 flex gap-2 sm:col-span-3 lg:col-span-1">
        <select
          name="sort"
          defaultValue={params.sort ?? "newest"}
          aria-label="เรียงตาม"
          className={selectClass}
        >
          <option value="newest">ใหม่สุด</option>
          <option value="cheapest">ถูกสุด</option>
        </select>
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          ค้นหา
        </button>
      </div>
    </form>
  );
}
