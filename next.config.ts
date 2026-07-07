import type { NextConfig } from "next";

// โดเมนรูปที่อนุญาตให้ next/image โหลด
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // R2 public bucket (r2.dev subdomain)
  { protocol: "https", hostname: "*.r2.dev" },
  // รูป placeholder จาก seed (dev เท่านั้น)
  { protocol: "https", hostname: "picsum.photos" },
  { protocol: "https", hostname: "fastly.picsum.photos" },
];

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

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
