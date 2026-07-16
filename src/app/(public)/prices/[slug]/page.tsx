// หน้าราคารายตัว (P2) — ราคาล่าสุด + 30 วันย้อนหลัง + sparkline + cross-link + Dataset JSON-LD
// ISR 1 ชม. + revalidate เมื่อแอดมินบันทึก · หลัง FLAGS.PRICES

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FLAGS } from "@/config/flags";
import {
  getPriceItemDetail,
  getListingsForPriceCategory,
  PRICES_BASE,
  pricePath,
  priceAbsoluteUrl,
  priceChange,
  priceMid,
  formatRange,
  isStale,
  PriceChange,
  PriceSparkline,
} from "@/features/prices";
import {
  getPriceCategoryLabel,
  listingCategoriesForPriceCategory,
} from "@/config/priceCategories";
import { getArticlesForListingCategories } from "@/features/directory/queries";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ArticleCard } from "@/features/articles/components/article-card";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

const monthYear = (d: Date) =>
  d.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!FLAGS.PRICES) return {};
  const { slug } = await params;
  const item = await getPriceItemDetail(decodeURIComponent(slug));
  if (!item) return { title: "ไม่พบข้อมูลราคา" };
  const latest = item.entries[0];
  const title = `ราคา${item.name}วันนี้ ล่าสุด ${monthYear(latest.date)} — ย้อนหลัง 30 วัน`;
  return {
    title,
    description: `ราคากลาง${item.name} (${item.unit}) ล่าสุด ${formatRange(latest)} ${item.unit} ณ ${formatThaiDate(latest.date)} พร้อมราคาย้อนหลัง 30 วัน${item.sourceName ? ` — อ้างอิง ${item.sourceName}` : ""}`,
    alternates: { canonical: pricePath(slug) },
  };
}

export default async function PriceDetailPage({ params }: Props) {
  if (!FLAGS.PRICES) notFound();
  const { slug } = await params;
  const item = await getPriceItemDetail(decodeURIComponent(slug));
  if (!item) notFound();

  const latest = item.entries[0];
  const change = priceChange(latest, item.entries[1]);
  const oldest = item.entries[item.entries.length - 1];

  const [nearbyListings, relatedArticles] = await Promise.all([
    getListingsForPriceCategory(item.category),
    getArticlesForListingCategories(
      listingCategoriesForPriceCategory(item.category),
    ),
  ]);

  // sparkline: เก่า→ใหม่
  const sparkValues = [...item.entries].reverse().map((e) => priceMid(e));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `ราคา${item.name} ย้อนหลัง 30 วัน`,
    description: `ราคากลาง${item.name} (${item.unit}) รายวันบน TaladKaset`,
    url: priceAbsoluteUrl(pricePath(item.slug)),
    temporalCoverage: `${oldest.date.toISOString().slice(0, 10)}/${latest.date.toISOString().slice(0, 10)}`,
    ...(item.sourceName
      ? { creator: { "@type": "Organization", name: item.sourceName } }
      : {}),
    variableMeasured: {
      "@type": "PropertyValue",
      name: `ราคา${item.name}`,
      unitText: item.unit,
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href={PRICES_BASE} className="hover:text-primary hover:underline">
          ราคากลางสินค้าเกษตร
        </Link>
        {" › "}
        <span>{getPriceCategoryLabel(item.category)}</span>
      </nav>

      <h1 className="mt-2 font-heading text-2xl font-bold text-foreground">
        ราคา{item.name}
      </h1>

      {/* ราคาล่าสุด — ป้ายทอง (signature) */}
      <div className="mt-3 inline-flex flex-col rounded-xl border-2 border-accent-gold bg-accent-gold/10 px-5 py-3">
        <span className="text-xs text-muted-foreground">
          ราคาล่าสุด · {formatThaiDate(latest.date)}
        </span>
        <span className="mt-0.5 font-num text-3xl font-bold text-accent-gold-foreground">
          {formatRange(latest)}{" "}
          <span className="text-lg font-semibold">{item.unit}</span>
        </span>
        <span className="mt-0.5 text-sm">
          <PriceChange change={change} />
          {change && change.dir !== "same" && (
            <span className="text-muted-foreground"> จากครั้งก่อน</span>
          )}
        </span>
      </div>

      {isStale(latest.date) && (
        <p className="mt-3 rounded-lg border border-accent-gold/40 bg-accent-gold/10 p-2.5 text-sm">
          ⚠️ ราคานี้ยังไม่ได้อัปเดตในช่วง 7 วันที่ผ่านมา
        </p>
      )}

      {sparkValues.length >= 2 && (
        <div className="mt-4">
          <PriceSparkline values={sparkValues} />
        </div>
      )}

      {/* ตาราง 30 วันย้อนหลัง */}
      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold text-primary-dk">
          ราคาย้อนหลัง
        </h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[22rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">วันที่</th>
                <th className="px-3 py-2 text-right font-medium">
                  ราคา ({item.unit})
                </th>
                <th className="px-3 py-2 text-right font-medium">เปลี่ยน</th>
              </tr>
            </thead>
            <tbody>
              {item.entries.map((e, i) => (
                <tr key={e.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatThaiDate(e.date)}
                  </td>
                  <td className="px-3 py-2 text-right font-num whitespace-nowrap">
                    {formatRange(e)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <PriceChange change={priceChange(e, item.entries[i + 1])} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {item.sourceName && (
          <p className="mt-2 text-xs text-muted-foreground">
            แหล่งอ้างอิง:{" "}
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                {item.sourceName} ↗
              </a>
            ) : (
              item.sourceName
            )}
          </p>
        )}
      </section>

      {nearbyListings.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            ประกาศขายที่เกี่ยวข้อง
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {nearbyListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-primary-dk">
            บทความที่เกี่ยวข้อง
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {relatedArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        ราคาอ้างอิง อาจต่างตามพื้นที่/คุณภาพ/ฤดูกาล — โปรดตรวจสอบกับผู้ซื้อ/ผู้ขายก่อนตัดสินใจ
      </p>
    </main>
  );
}
