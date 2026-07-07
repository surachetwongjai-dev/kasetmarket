// Storage layer สำหรับอัปโหลดรูป (server-only)
// - มี R2 credentials ครบ → presigned URL ไป Cloudflare R2 (production)
// - ไม่มี → local driver เก็บลง .uploads/ (dev เท่านั้น ระหว่างยังไม่ตั้ง R2)
// ฝั่ง client ใช้ flow เดียวกันทั้งสอง driver: POST /api/upload → PUT ไฟล์ไปที่ uploadUrl

import { createHmac } from "crypto";
import { AwsClient } from "aws4fetch";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB หลัง compress (PLAN M4)
export const ALLOWED_CONTENT_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

const EXT_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export type UploadTarget = {
  /** URL ให้ client PUT ไฟล์ขึ้นไปตรงๆ */
  uploadUrl: string;
  /** URL สาธารณะของรูปหลังอัปเสร็จ (เก็บลง DB) */
  publicUrl: string;
  /** key ภายใน bucket/โฟลเดอร์ */
  key: string;
};

function r2Config() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
  } = process.env;
  if (
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET &&
    R2_PUBLIC_BASE_URL
  ) {
    return {
      accountId: R2_ACCOUNT_ID,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucket: R2_BUCKET,
      publicBaseUrl: R2_PUBLIC_BASE_URL.replace(/\/$/, ""),
    };
  }
  return null;
}

export function storageDriver(): "r2" | "local" {
  return r2Config() ? "r2" : "local";
}

/** สร้าง key ใหม่ ปลอดภัยต่อ path (ไม่มีชื่อไฟล์จากผู้ใช้ปน) */
export function newImageKey(contentType: string): string {
  const ext = EXT_BY_TYPE[contentType] ?? "bin";
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `listings/${ym}/${crypto.randomUUID()}.${ext}`;
}

const PRESIGN_EXPIRES_SEC = 600; // 10 นาที

/** สร้างเป้าหมายอัปโหลดตาม driver ที่ใช้งานอยู่ */
export async function createUploadTarget(
  contentType: string,
): Promise<UploadTarget> {
  const key = newImageKey(contentType);
  const r2 = r2Config();

  if (r2) {
    const client = new AwsClient({
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    });
    const url = new URL(
      `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucket}/${key}`,
    );
    url.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRES_SEC));
    const signed = await client.sign(
      new Request(url, { method: "PUT" }),
      { aws: { signQuery: true, service: "s3", region: "auto" } },
    );
    return {
      uploadUrl: signed.url,
      publicUrl: `${r2.publicBaseUrl}/${key}`,
      key,
    };
  }

  // local driver — เซ็น key + expiry ด้วย HMAC (เลียนแบบ presigned URL)
  const expires = Math.floor(Date.now() / 1000) + PRESIGN_EXPIRES_SEC;
  const token = signLocalUpload(key, expires);
  const params = new URLSearchParams({
    key,
    expires: String(expires),
    token,
  });
  return {
    uploadUrl: `/api/upload/local?${params}`,
    publicUrl: `/api/uploads/${key}`,
    key,
  };
}

// ---------- local driver helpers ----------

function hmacSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return secret;
}

export function signLocalUpload(key: string, expires: number): string {
  return createHmac("sha256", hmacSecret())
    .update(`upload:${key}:${expires}`)
    .digest("hex");
}

export function verifyLocalUpload(
  key: string,
  expires: number,
  token: string,
): boolean {
  if (!Number.isFinite(expires) || expires < Date.now() / 1000) return false;
  return signLocalUpload(key, expires) === token;
}

/** กัน path traversal — key ต้องเป็นรูปแบบที่เราสร้างเองเท่านั้น */
export function isSafeKey(key: string): boolean {
  return /^[a-z0-9/_.-]+$/i.test(key) && !key.includes("..") && !key.startsWith("/");
}
