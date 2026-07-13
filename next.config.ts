import type { NextConfig } from "next";

// โดเมนรูปที่อนุญาตให้ next/image โหลด
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // R2 public bucket (r2.dev subdomain)
  { protocol: "https", hostname: "*.r2.dev" },
];

// รูป placeholder จาก seed — อนุญาตเฉพาะนอก Vercel (dev + ทดสอบ prod build ในเครื่อง)
if (process.env.VERCEL !== "1") {
  remotePatterns.push(
    { protocol: "https", hostname: "picsum.photos" },
    { protocol: "https", hostname: "fastly.picsum.photos" },
  );
}

// ถ้าตั้ง custom domain ให้ R2 (R2_PUBLIC_BASE_URL) เพิ่มโฮสต์นั้นด้วย
if (process.env.R2_PUBLIC_BASE_URL) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(process.env.R2_PUBLIC_BASE_URL).hostname,
    });
  } catch {
    // URL ผิดรูปแบบ — ปล่อยให้ storage layer ฟ้องตอน runtime
  }
}

// Security headers พื้นฐานสำหรับ production (ยังไม่ใส่ CSP เต็ม — เสี่ยงชน inline script
// ของ Next + YouTube embed, ค่อยพิจารณาหลัง launch)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: { remotePatterns },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Directory ร้านค้า: URL สาธารณะเป็นไทย /ร้านค้า (SEO — CLAUDE.md §10) แต่โฟลเดอร์ route
  // เป็น ascii /shops เพราะ Next 15.5 มีบั๊ก match static segment ที่เป็น unicode ไม่ได้
  // (percent-encoded request จาก browser จริงคืน 404 — ทดสอบแล้วกับ next start)
  async rewrites() {
    // ต้องมีทั้งรูป percent-encoded (browser/crawler ส่งจริง) และรูป literal (บาง client ส่ง raw bytes)
    const thaiRoutes: [string, string][] = [
      ["ร้านค้า", "/shops"],
      ["ลงทะเบียนร้านค้า", "/register-shop"],
      ["ราคาสินค้าเกษตร", "/prices"],
      ["จับคู่ซื้อขาย", "/matching"],
      ["ชุมชน", "/community"],
    ];
    // กฎเฉพาะต้องมาก่อนกฎ :path* (first match wins): /ลงทะเบียนร้านค้า/สำเร็จ → หน้า success
    const successSource = `/${encodeURIComponent("ลงทะเบียนร้านค้า")}/${encodeURIComponent("สำเร็จ")}`;
    const explicit = [
      { source: successSource, destination: "/register-shop/success" },
      { source: "/ลงทะเบียนร้านค้า/สำเร็จ", destination: "/register-shop/success" },
    ];
    return explicit.concat(
      thaiRoutes.flatMap(([thai, internal]) => {
      const encoded = encodeURIComponent(thai);
      return [
        { source: `/${encoded}`, destination: internal },
        { source: `/${encoded}/:path*`, destination: `${internal}/:path*` },
        { source: `/${thai}`, destination: internal },
        { source: `/${thai}/:path*`, destination: `${internal}/:path*` },
      ];
      }),
    );
  },
  // กันเข้าถึง path ภายในตรงๆ ซ้ำกับ URL ไทย (duplicate content) — เด้งกลับ URL หลัก
  async redirects() {
    return [
      { source: "/shops", destination: "/ร้านค้า", permanent: true },
      { source: "/shops/:path*", destination: "/ร้านค้า/:path*", permanent: true },
      { source: "/register-shop", destination: "/ลงทะเบียนร้านค้า", permanent: true },
      {
        source: "/register-shop/:path*",
        destination: "/ลงทะเบียนร้านค้า/:path*",
        permanent: true,
      },
      { source: "/prices", destination: "/ราคาสินค้าเกษตร", permanent: true },
      {
        source: "/prices/:path*",
        destination: "/ราคาสินค้าเกษตร/:path*",
        permanent: true,
      },
      { source: "/matching", destination: "/จับคู่ซื้อขาย", permanent: true },
      {
        source: "/matching/:path*",
        destination: "/จับคู่ซื้อขาย/:path*",
        permanent: true,
      },
      { source: "/community", destination: "/ชุมชน", permanent: true },
      {
        source: "/community/:path*",
        destination: "/ชุมชน/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
