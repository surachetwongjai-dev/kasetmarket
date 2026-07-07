// GET /api/uploads/<key> — เสิร์ฟรูปของ local driver (dev เท่านั้น)
// ตอนใช้ R2 จริง publicUrl จะชี้ไป R2 โดยตรง ไม่ผ่าน route นี้

import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isSafeKey } from "@/lib/storage";

const UPLOAD_DIR = path.join(process.cwd(), ".uploads");

const TYPE_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const key = segments.join("/");
  if (!isSafeKey(key)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const file = await readFile(path.join(UPLOAD_DIR, key));
    const contentType =
      TYPE_BY_EXT[path.extname(key).toLowerCase()] ??
      "application/octet-stream";
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
