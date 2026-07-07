// PUT /api/upload/local — ปลายทางอัปโหลดของ local driver (dev เท่านั้น ระหว่างยังไม่ตั้ง R2)
// ตรวจ HMAC token ที่เซ็นจาก /api/upload (เลียนแบบ presigned URL — ไม่ต้องมี session ที่นี่)

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  MAX_UPLOAD_BYTES,
  isSafeKey,
  storageDriver,
  verifyLocalUpload,
} from "@/lib/storage";

const UPLOAD_DIR = path.join(process.cwd(), ".uploads");

export async function PUT(request: Request) {
  if (storageDriver() !== "local") {
    return NextResponse.json({ error: "ใช้ R2 อยู่" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") ?? "";
  const expires = Number(searchParams.get("expires"));
  const token = searchParams.get("token") ?? "";

  if (!isSafeKey(key) || !verifyLocalUpload(key, expires, token)) {
    return NextResponse.json(
      { error: "ลิงก์อัปโหลดไม่ถูกต้องหรือหมดอายุ" },
      { status: 403 },
    );
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.length === 0 || body.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 413 });
  }

  const filePath = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body);

  return NextResponse.json({ ok: true, key });
}
