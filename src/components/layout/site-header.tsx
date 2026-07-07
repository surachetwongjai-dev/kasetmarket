import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/listings", label: "ประกาศขาย" },
  { href: "/articles", label: "บทความเกษตร" },
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

        <div className="ml-auto flex items-center gap-2">
          {/* ปุ่มชี้ไป /login ก่อน — dashboard/auth มาใน M3/M5 */}
          <Button variant="ghost" className="min-h-10 px-2 sm:px-4" asChild>
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
          <Button className="min-h-10" asChild>
            <Link href="/login">
              <span className="hidden sm:inline">+ </span>ลงประกาศฟรี
            </Link>
          </Button>
        </div>
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
