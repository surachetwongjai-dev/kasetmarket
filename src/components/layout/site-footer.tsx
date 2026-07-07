import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/terms", label: "ข้อตกลงการใช้งาน" },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-primary-dk text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-heading text-lg font-bold">🌾 KasetMarket</p>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
            ตลาดกลางซื้อขายสินค้าเกษตร ลงประกาศฟรี
            ผู้ซื้อติดต่อผู้ขายโดยตรงทางโทรศัพท์หรือ LINE
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} KasetMarket
        </p>
      </div>
    </footer>
  );
}
