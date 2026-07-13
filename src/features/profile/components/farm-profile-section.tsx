// หน้าโปรไฟล์เกษตรกร (U2) — บล็อกข้อมูลฟาร์ม/ไร่/ร้าน บนหน้า public /sellers/[id]
// server component (gallery ข้างในเป็น client) · แสดงเฉพาะเมื่อมีข้อมูลจริง (hasFarmContent)

import { getFarmType } from "@/config/farmTypes";
import { ListingGallery } from "@/features/listings/components/listing-gallery";

export type FarmProfileView = {
  bio: string | null;
  farmTypes: string[];
  products: string | null;
  sizeRai: number | null;
  images: { id: string; url: string }[];
};

/** มีข้อมูลฟาร์มให้แสดงไหม — ถ้าไม่มีเลย ให้หน้าเป็นแบบเดิม (ไม่พังของเก่า) */
export function hasFarmContent(p: FarmProfileView | null | undefined): p is FarmProfileView {
  return Boolean(
    p &&
      (p.bio ||
        p.products ||
        p.sizeRai != null ||
        p.farmTypes.length > 0 ||
        p.images.length > 0),
  );
}

export function FarmProfileSection({
  profile,
  sellerName,
}: {
  profile: FarmProfileView;
  sellerName: string;
}) {
  const chips = profile.farmTypes
    .map((v) => getFarmType(v))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-primary-dk">
        เกี่ยวกับ {sellerName}
      </h2>

      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {chips.map((t) => (
            <li
              key={t.value}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary-dk"
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </li>
          ))}
        </ul>
      )}

      {(profile.products || profile.sizeRai != null) && (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {profile.products && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">สินค้าหลัก</dt>
              <dd className="font-medium text-foreground">{profile.products}</dd>
            </div>
          )}
          {profile.sizeRai != null && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">ขนาดพื้นที่</dt>
              <dd className="font-medium text-foreground">
                {profile.sizeRai.toLocaleString("th-TH")} ไร่
              </dd>
            </div>
          )}
        </dl>
      )}

      {profile.bio && (
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
          {profile.bio}
        </p>
      )}

      {profile.images.length > 0 && (
        <div className="mt-4 max-w-xl">
          <ListingGallery images={profile.images} title={`ฟาร์มของ ${sellerName}`} />
        </div>
      )}
    </section>
  );
}
