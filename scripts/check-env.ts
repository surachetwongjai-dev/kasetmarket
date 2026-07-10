/**
 * ตรวจ environment variables ก่อน build (PLAN.md M11)
 * รันอัตโนมัติก่อน `npm run build` (prebuild) หรือรันเอง: npm run check-env
 *
 * โหมดเข้มงวด (บังคับ env ครบชุด production): เปิดอัตโนมัติบน Vercel
 * หรือทดสอบในเครื่องด้วย CHECK_ENV_STRICT=1
 */

// โหลด .env ถ้ามีไฟล์ (บน Vercel ไม่มีไฟล์ — ค่าอยู่ใน process.env อยู่แล้ว)
try {
  process.loadEnvFile();
} catch {
  // ไม่มี .env ก็ไม่เป็นไร
}

const strict =
  process.env.VERCEL === "1" || process.env.CHECK_ENV_STRICT === "1";

const errors: string[] = [];
const warnings: string[] = [];

const has = (name: string) => !!process.env[name]?.trim();

// จำเป็นเสมอ — ไม่มีแล้วแอปรันไม่ได้
for (const name of ["DATABASE_URL", "AUTH_SECRET"]) {
  if (!has(name)) errors.push(`${name} — จำเป็นเสมอ`);
}

if (!has("DIRECT_URL")) {
  warnings.push("DIRECT_URL — จำเป็นตอนรัน prisma migrate");
}

// R2: ต้องครบทั้ง 5 ค่าหรือไม่ใส่เลย (storage layer สลับ driver จากความครบของชุดนี้)
const R2_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_BASE_URL",
];
const r2Set = R2_KEYS.filter(has);
if (r2Set.length > 0 && r2Set.length < R2_KEYS.length) {
  errors.push(
    `R2 ใส่ไม่ครบ (${r2Set.length}/5) — ขาด: ${R2_KEYS.filter((k) => !has(k)).join(", ")}`,
  );
}

// ชุดที่ production ขาดไม่ได้ (dev เตือนเฉยๆ)
const PROD_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "LINE_CLIENT_ID",
  "LINE_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];
for (const name of PROD_KEYS) {
  if (!has(name)) {
    (strict ? errors : warnings).push(`${name} — จำเป็นบน production`);
  }
}
if (strict) {
  if (r2Set.length === 0) {
    errors.push(
      "R2_* ทั้ง 5 ค่า — production ต้องใช้ R2 (local driver ใช้ได้เฉพาะ dev)",
    );
  }
  if (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
    errors.push("NEXT_PUBLIC_SITE_URL ยังชี้ localhost — ต้องเป็นโดเมนจริง");
  }
}

if (warnings.length > 0) {
  console.warn(
    `\n⚠️  env ที่ยังไม่ได้ตั้ง${strict ? "" : " (ยังไม่บังคับนอก production)"}:`,
  );
  for (const w of warnings) console.warn(`   - ${w}`);
}

if (errors.length > 0) {
  console.error(`\n❌ env ไม่ผ่าน (โหมด${strict ? "เข้มงวด/production" : "dev"}):`);
  for (const e of errors) console.error(`   - ${e}`);
  console.error("\nดูวิธีตั้งค่าใน .env.sample\n");
  process.exit(1);
}

console.log(`✅ env ครบ (โหมด${strict ? "เข้มงวด/production" : "dev"})`);
