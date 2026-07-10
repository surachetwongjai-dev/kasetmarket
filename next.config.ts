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
};

export default nextConfig;
