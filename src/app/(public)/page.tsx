// หน้าแรก — ประกอบทุกอย่างเป็นเว็บสมบูรณ์ (M9)
// Server Component ดึงข้อมูลจริง; ประกาศ revalidate สั้นเพราะเป็นหน้าแรก

import Link from "next/link";
import type { Metadata } from "next";
import {
  getFeaturedListings,
  getLatestListings,
} from "@/features/listings/queries";
import { getPublishedArticles } from "@/features/articles/queries";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ArticleCard } from "@/features/articles/components/article-card";
import {
  getHomeFeaturedPrices,
  pricePath,
  PRICES_BASE,
  formatRange,
  priceChange,
  PriceChange,
} from "@/features/prices";
import {
  getLatestMatchPosts,
  MatchPostCard,
  MATCHING_BASE,
} from "@/features/matching";
import {
  getLatestThreads,
  ThreadCard,
  COMMUNITY_BASE,
} from "@/features/community";
import { CATEGORIES } from "@/config/categories";
import { FLAGS } from "@/config/flags";
import { SITE_NAME, SITE_URL, YOUTUBE_CHANNEL_URL } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "KasetMarket — ตลาดสินค้าเกษตร จากมือเกษตรกรถึงคุณ",
  description:
    "ลงประกาศขายสินค้าเกษตรฟรี ข้าว ผัก ผลไม้ ปุ๋ย เครื่องจักร ที่ดิน ผู้ซื้อติดต่อผู้ขายโดยตรง พร้อมคลังบทความความรู้เกษตร",
  alternates: { canonical: "/" },
};

// WebSite + Organization schema — ช่วย Google เข้าใจแบรนด์ + เปิดโอกาส sitelinks search box
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "ตลาดกลางซื้อขายสินค้าเกษตรออนไลน์ ลงประกาศฟรี พร้อมคลังบทความความรู้เกษตร",
      ...(YOUTUBE_CHANNEL_URL ? { sameAs: [YOUTUBE_CHANNEL_URL] } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "th-TH",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/listings?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function HomePage() {
  const [featured, latest, articles, homePrices, matchPosts, threads] =
    await Promise.all([
      getFeaturedListings(4),
      getLatestListings(12),
      getPublishedArticles({ page: 1 }),
      FLAGS.PRICES ? getHomeFeaturedPrices() : Promise.resolve([]),
      FLAGS.MATCHING ? getLatestMatchPosts(6) : Promise.resolve([]),
      FLAGS.COMMUNITY ? getLatestThreads(3) : Promise.resolve([]),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      {/* Hero + ค้นหา */}
      <section className="py-8 text-center sm:py-12">
        <h1 className="font-heading text-3xl leading-tight font-bold text-primary-dk sm:text-4xl">
          ตลาดสินค้าเกษตร จากมือเกษตรกรถึงคุณ
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          ลงประกาศฟรี ไม่มีค่าธรรมเนียม ผู้ซื้อติดต่อผู้ขายโดยตรงทางโทรศัพท์หรือ
          LINE
        </p>
        <form
          method="GET"
          action="/listings"
          className="mx-auto mt-6 flex max-w-xl gap-2"
        >
          <input
            type="search"
            name="q"
            placeholder="ค้นหาสินค้า เช่น ข้าวหอมมะลิ ทุเรียน ปุ๋ย"
            aria-label="ค้นหาประกาศ"
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ค้นหา
          </button>
        </form>
        <div className="mt-3">
          <Link
            href="/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            + ลงประกาศขายฟรี
          </Link>
        </div>
      </section>

      {/* แถบหมวดหมู่ */}
      <section className="pb-8">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/listings?category=${cat.value}`}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="text-2xl" aria-hidden>
                {cat.icon}
              </span>
              <span className="text-xs font-medium leading-tight sm:text-sm">
                {cat.label.split(/[/(]/)[0].trim()}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* แถบราคาวันนี้ (เมื่อเปิด FLAGS.PRICES) */}
      {homePrices.length > 0 && (
        <section className="pb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-primary-dk">
              📊 ราคาวันนี้
            </h2>
            <Link
              href={PRICES_BASE}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ดูราคาทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {homePrices.map((p) => {
              const latest = p.entries[0];
              return (
                <Link
                  key={p.id}
                  href={pricePath(p.slug)}
                  className="rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.name}
                  </p>
                  <p className="mt-1 font-num text-lg font-bold text-accent-gold-foreground">
                    {formatRange(latest)}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.unit}</p>
                  <p className="mt-0.5 text-xs">
                    <PriceChange change={priceChange(latest, p.entries[1])} />
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* กระดานจับคู่ซื้อขาย (เมื่อเปิด FLAGS.MATCHING) */}
      {matchPosts.length > 0 && (
        <HomeSection
          title="🤝 กระดานจับคู่ซื้อขาย"
          href={MATCHING_BASE}
          linkLabel="ดูกระดานทั้งหมด"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchPosts.map((post) => (
              <MatchPostCard key={post.id} post={post} />
            ))}
          </div>
        </HomeSection>
      )}

      {/* ประกาศเด่น */}
      {featured.length > 0 && (
        <HomeSection
          title="⭐ ประกาศเด่น"
          href="/listings"
          linkLabel="ดูทั้งหมด"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </HomeSection>
      )}

      {/* ประกาศล่าสุด */}
      {latest.length > 0 ? (
        <HomeSection
          title="ประกาศล่าสุด"
          href="/listings"
          linkLabel="ดูทั้งหมด"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </HomeSection>
      ) : (
        <section className="py-10 text-center text-muted-foreground">
          ยังไม่มีประกาศในตอนนี้ —{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            เป็นคนแรกที่ลงประกาศ
          </Link>
        </section>
      )}

      {/* แถบ YouTube (ตั้งค่า NEXT_PUBLIC_YOUTUBE_URL ก่อน launch) */}
      {YOUTUBE_CHANNEL_URL && (
        <section className="my-8 rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <p className="font-heading text-xl font-bold text-primary-dk">
            📺 ความรู้เกษตรจากช่อง YouTube ของเรา
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            เทคนิคทำเกษตร รีวิวสินค้า และข่าวสารวงการเกษตร อัปเดตทุกสัปดาห์
          </p>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#FF0000] px-5 font-semibold text-white transition-opacity hover:opacity-90"
          >
            ดูช่อง YouTube
          </a>
        </section>
      )}

      {/* จากชุมชน (เมื่อเปิด FLAGS.COMMUNITY) */}
      {threads.length > 0 && (
        <HomeSection
          title="💬 จากชุมชน"
          href={COMMUNITY_BASE}
          linkLabel="เข้าชุมชน"
        >
          <div className="flex flex-col gap-3">
            {threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        </HomeSection>
      )}

      {/* บทความล่าสุด */}
      {articles.items.length > 0 && (
        <HomeSection
          title="บทความความรู้เกษตร"
          href="/articles"
          linkLabel="อ่านทั้งหมด"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {articles.items.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </HomeSection>
      )}
    </div>
  );
}

function HomeSection({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-primary-dk">
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}
