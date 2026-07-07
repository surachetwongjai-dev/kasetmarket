import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/config/categories";
import { formatPricePerUnit } from "@/lib/format";

// ตัวอย่างประกาศ (placeholder) — ใช้โชว์ design system จนกว่าจะมีข้อมูลจริง (M2+)
const SAMPLE_LISTINGS = [
  {
    title: "ขายข้าวหอมมะลิ 105 เกี่ยวใหม่",
    price: 12500,
    unit: "ton",
    province: "สุรินทร์",
    postedAgo: "2 ชม.ที่แล้ว",
    emoji: "🌾",
    featured: true,
  },
  {
    title: "ทุเรียนหมอนทองเกรด A ตัดสุก",
    price: 145,
    unit: "kg",
    province: "จันทบุรี",
    postedAgo: "5 ชม.ที่แล้ว",
    emoji: "🥭",
    featured: false,
  },
  {
    title: "ต้นกล้ามะนาวแป้นพิจิตร พร้อมปลูก",
    price: 35,
    unit: "tree",
    province: "พิจิตร",
    postedAgo: "เมื่อวาน",
    emoji: "🌱",
    featured: false,
  },
  {
    title: "รถไถเดินตามมือสอง สภาพดี",
    price: 28000,
    unit: "machine",
    province: "นครราชสีมา",
    postedAgo: "2 วันที่แล้ว",
    emoji: "🚜",
    featured: false,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-10 text-center sm:py-16">
        <h1 className="text-3xl leading-tight text-primary-dk sm:text-4xl">
          ตลาดสินค้าเกษตร จากมือเกษตรกรถึงคุณ
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          ลงประกาศฟรี ไม่มีค่าธรรมเนียม ผู้ซื้อติดต่อผู้ขายโดยตรงทางโทรศัพท์หรือ
          LINE
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="w-full min-h-11 sm:w-auto" asChild>
            <Link href="/listings">ดูประกาศทั้งหมด</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full min-h-11 sm:w-auto"
            asChild
          >
            <Link href="/login">+ ลงประกาศฟรี</Link>
          </Button>
        </div>
      </section>

      {/* หมวดหมู่ */}
      <section className="pb-10">
        <h2 className="mb-4 text-xl">หมวดหมู่สินค้า</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/listings?category=${cat.value}`}
              className="rounded-full border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ประกาศล่าสุด (ตัวอย่าง) */}
      <section className="pb-12">
        <h2 className="mb-4 text-xl">ประกาศล่าสุด</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SAMPLE_LISTINGS.map((listing) => (
            <Card key={listing.title} className="overflow-hidden py-0">
              <div className="relative flex aspect-[4/3] items-center justify-center bg-secondary text-5xl">
                <span aria-hidden>{listing.emoji}</span>
                {listing.featured && (
                  <Badge className="absolute left-2 top-2 bg-accent-gold text-accent-gold-foreground">
                    ประกาศเด่น
                  </Badge>
                )}
              </div>
              <CardContent className="space-y-2 p-3 pt-0 pb-4">
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {listing.title}
                </p>
                {/* ป้ายราคาต่อหน่วย — signature element */}
                <p className="inline-block rounded-md border border-accent-gold bg-accent-gold/10 px-2 py-1 font-num text-sm font-bold tabular-nums text-accent-gold-foreground">
                  {formatPricePerUnit(listing.price, listing.unit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  📍 {listing.province} · {listing.postedAgo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ข้อมูลตัวอย่าง — ระบบประกาศจริงกำลังพัฒนา
        </p>
      </section>
    </div>
  );
}
