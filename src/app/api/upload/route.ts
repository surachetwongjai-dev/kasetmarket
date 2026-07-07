// POST /api/upload — ขอ URL สำหรับอัปรูป 1 ไฟล์ (ต้องล็อกอิน)
// client บีบอัดรูปก่อนแล้วค่อยขอ (ดู lib/image-compress.ts)

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/features/auth";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  createUploadTarget,
} from "@/lib/storage";

const bodySchema = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, "ไฟล์ใหญ่เกิน 5MB"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดรูป" },
      { status: 401 },
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
