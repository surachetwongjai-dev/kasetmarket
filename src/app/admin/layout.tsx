// Layout ส่วนแอดมิน — ตรวจ role + แท็บนำทาง (mobile-first: แอดมินกดอนุมัติจากมือถือบ่อย)

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { FLAGS } from "@/config/flags";

const TABS = [
  { href: "/admin", label: "ภาพรวม" },
  { href: "/admin/moderation", label: "คิวอนุมัติ" },
  { href: "/admin/users", label: "ผู้ใช้" },
  { href: "/admin/verifications", label: "ยืนยันตัวตน" },
  { href: "/admin/reports", label: "รายงาน" },
  ...(FLAGS.REVIEWS ? [{ href: "/admin/reviews", label: "รีวิว" }] : []),
  { href: "/admin/listings", label: "ประกาศ" },
  { href: "/admin/articles", label: "บทความ" },
  { href: "/admin/shops", label: "ร้านค้า" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        ผู้ดูแลระบบ
      </h1>
      <nav className="mt-3 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="shrink-0 rounded-t-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="py-5">{children}</div>
    </div>
  );
}
