// POST /api/upload/shop — ขอ URL อัปรูปสำหรับฟอร์มลงทะเบียนร้าน (D5)
// ไม่บังคับล็อกอิน (สเปค §10: ลด friction เจ้าของร้านสูงวัย) จึงกันสแปมด้วย
// rate limit ต่อ IP — in-memory ต่อ instance (บน serverless รีเซ็ตเมื่อ cold start
// ยอมรับได้ใน MVP เพราะรูปไม่แสดงที่ไหนจนกว่าแอดมินจะ approve ร้าน)

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  createUploadTarget,
} from "@/lib/storage";

const bodySchema = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "ไฟล์ใหญ่เกิน 5MB"),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 12; // พอสำหรับกรอกฟอร์ม 2-3 ครั้ง (ครั้งละ ≤4 รูป)
const hits = new Map<string, number[]>();

function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // กัน map โตไม่จำกัด
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) {
    return NextResponse.json(
      { error: "อัปโหลดถี่เกินไป กรุณาลองใหม่ในอีก 1 ชั่วโมง" },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ไฟล์ไม่ถูกต้อง — รองรับ webp/jpeg/png ขนาดไม่เกิน 5MB" },
      { status: 400 },
    );
  }

  const target = await createUploadTarget(parsed.data.contentType);
  return NextResponse.json(target);
}
