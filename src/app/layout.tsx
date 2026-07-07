import type { Metadata } from "next";
import {
  Anuphan,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Thai_Looped,
} from "next/font/google";
import "./globals.css";
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
  title: {
    default: "KasetMarket — ตลาดกลางซื้อขายสินค้าเกษตร",
    template: "%s | KasetMarket",
  },
  description:
    "แหล่งซื้อขายสินค้าเกษตรโดยตรงจากเกษตรกร ข้าว ผัก ผลไม้ ต้นกล้า ปุ๋ย เครื่องจักรเกษตร ลงประกาศฟรี ติดต่อผู้ขายตรงทางโทรหรือ LINE",
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
