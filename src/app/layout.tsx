import type { Metadata } from "next";
import {
  Anuphan,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Thai_Looped,
} from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

// Display / หัวข้อ — โมเดิร์น สะอาด อ่านไทยชัด (variable font)
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  variable: "--font-anuphan",
  display: "swap",
});

// Body — อ่านสบายบนมือถือ
const plexThai = IBM_Plex_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-thai",
  display: "swap",
});

// ตัวเลข/ราคา — ใช้คู่กับ tabular-nums ให้ราคาตรงคอลัมน์
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase ทำให้ canonical + og:image แบบ relative resolve เป็น absolute URL ได้
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ตลาดกลางซื้อขายสินค้าเกษตร`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "แหล่งซื้อขายสินค้าเกษตรโดยตรงจากเกษตรกร ข้าว ผัก ผลไม้ ต้นกล้า ปุ๋ย เครื่องจักรเกษตร ลงประกาศฟรี ติดต่อผู้ขายตรงทางโทรหรือ LINE",
  // ค่า default ที่ทุกหน้าใช้ร่วม — หน้าไหนไม่ตั้ง openGraph เองจะสืบทอดชุดนี้
  // (og:title/og:description เติมจาก title/description ของแต่ละหน้าอัตโนมัติ)
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${anuphan.variable} ${plexThai.variable} ${plexSans.variable}`}
    >
      <body className="flex min-h-svh flex-col antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
