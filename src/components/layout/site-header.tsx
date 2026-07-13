import Link from "next/link";
import { HeaderAuth } from "@/components/layout/header-auth";
import { FLAGS } from "@/config/flags";

const NAV_LINKS = [
  { href: "/listings", label: "ประกาศขาย" },
  ...(FLAGS.MATCHING ? [{ href: "/จับคู่ซื้อขาย", label: "จับคู่ซื้อขาย" }] : []),
  { href: "/ร้านค้า", label: "ร้านค้าเกษตร" },
  ...(FLAGS.PRICES ? [{ href: "/ราคาสินค้าเกษตร", label: "ราคากลาง" }] : []),
  { href: "/articles", label: "บทความเกษตร" },
  ...(FLAGS.COMMUNITY ? [{ href: "/ชุมชน", label: "ชุมชน" }] : []),
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-heading text-lg font-bold text-primary-dk sm:text-xl"
        >
          <span aria-hidden>🌾</span>
          <span>
            Kaset<span className="text-primary">Market</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ปุ่มฝั่งขวาขึ้นกับสถานะล็อกอิน (client) — คง ISR ของหน้า public ไว้ */}
        <HeaderAuth />
      </div>

      {/* nav บนมือถือ */}
      <nav className="flex border-t sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex-1 py-3 text-center text-sm font-medium text-foreground active:bg-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
