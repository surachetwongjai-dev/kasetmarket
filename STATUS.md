# STATUS.md — KasetMarket

> อัปเดตหลังจบทุก milestone — session ใหม่อ่านไฟล์นี้คู่กับ CLAUDE.md + PLAN.md

- **Milestone ปัจจุบัน:** M8 เสร็จแล้ว ✅ — พร้อมเริ่ม M9 (หน้าแรก + โปรไฟล์ผู้ขาย + Sitemap)
- **อัปเดตล่าสุด:** 2026-07-07

---

## M8: บทความ + CMS ✅ (2026-07-07)

### สิ่งที่ทำ

- `config/articleCategories.ts`: 5 หมวด (ปุ๋ย/โรคพืช/ราคาตลาด/เทคนิค/ข่าวเกษตร) เก็บ label ไทยตรงๆ ใน DB (ตรงกับ seed M2) + **mapping ไปหมวดประกาศ** สำหรับ CTA
- `lib/markdown.ts`: `marked` แปลง MD→HTML (⚠️ ไม่ sanitize — บทความเขียนโดยแอดมิน = trusted; ถ้าเปิดให้คนอื่นเขียนต้องเพิ่ม sanitize ก่อน) + `stripMarkdown` สำหรับ meta description
- `features/articles/` ครบ: schemas (zod), actions (create/update/toggle publish/delete — admin only, slug retry, `publishedAt` ตั้งครั้งแรกไม่รีเซ็ต), queries (public เห็นเฉพาะ published), components (article-card, article-form, cover-uploader, article-admin-actions)
- **CMS `/admin/articles`** (+ `/new`, `/[id]/edit`): ฟอร์ม Markdown + **ปุ่มสลับ preview สด** (marked ฝั่ง client), อัปรูปปก (reuse compress+upload M4), เลือกหมวด, publish/draft toggle, ลบ — เพิ่มแท็บ "บทความ" ใน admin layout
- **Public `/articles`** (ISR 1 ชม.): grid + filter หมวดแบบ chip · **`/articles/[slug]`** (ISR 1 ชม.): render Markdown ด้วย `.article-prose` (สไตล์เขียนเองใน globals.css — ไม่มี typography plugin), JSON-LD `Article`, บทความเกี่ยวข้องหมวดเดียวกัน 3 เรื่อง, **CTA → หมวดประกาศที่เกี่ยว** (ชั้นคอนเทนต์→รายได้ §8), นับยอดอ่าน
- ViewTracker ทำเป็น generic (endpoint + dedupeKey) ใช้ร่วมประกาศ+บทความ, เพิ่ม `/api/articles/[id]/view`

### ทดสอบแล้ว (E2E บน browser จริง)

- [x] `/articles` แสดง 3 seed + filter chip 5 หมวด, `/articles/[slug]` render MD ครบ (h2/strong/blockquote/list), JSON-LD `Article`, CTA ไปหมวดปุ๋ย
- [x] **Flow CMS:** admin เขียนบทความใหม่ (หมวดเทคนิค) → preview สดถูกต้อง → ติ๊กเผยแพร่ → บันทึก → **ขึ้นหน้า public ทันที** (revalidate) → related article โผล่ (จับคู่หมวดเทคนิคกับ seed เดิมได้)
- [x] เลิกเผยแพร่ → **หายจาก public** (4→3), ลบ → หายจากระบบ
- [x] มือถือ 375px: body 16px, ไม่มี horizontal scroll, CTA แสดง
- [x] `npm run build` ผ่าน — ข้อมูลทดสอบล้างหมด (DB = seed 3 บทความ)
- ยังไม่ได้วัด: Google Rich Results Test (ต้อง public URL — วัดตอน deploy) — JSON-LD Article มีโครงครบ (headline/description/datePublished/author/publisher)

### Next step (M9)

- หน้าแรกประกอบร่าง (ประกาศล่าสุด+เด่น+หมวด+บทความล่าสุด), หน้าโปรไฟล์ผู้ขาย `/sellers/[id]`, sitemap.xml + robots.txt
- งานผู้ใช้ค้าง: ทดสอบ LINE/Google (port 3000), ใส่ R2, เตรียมบทความจริง 15-20 เรื่องจากสคริปต์ YouTube (Claude ช่วยแปลง MD ได้)

---

## M7: Admin — Moderation + จัดการ user ✅ (2026-07-07)

### สิ่งที่ทำ

- Schema: `User.banned`, `Listing.rejectReason` (migration `20260707173554_search_and_admin` รวมกับ pg_trgm ของ M6)
- `features/moderation/` ครบ: queries (สถิติ, คิว PENDING, users+ค้นหา, reports, ค้นประกาศ), actions ทุกตัวผ่าน `requireAdmin()` — approve / reject พร้อมเหตุผล (zod ≥5 ตัวอักษร) / toggle featured / toggle verify / toggle ban (กันแบนตัวเอง+แอดมิน) / resolve report / **ปิดประกาศจากรายงาน** (REJECTED + เหตุผลอัตโนมัติ + resolve ใน transaction เดียว)
- หน้า admin (มี `admin/layout.tsx` ตรวจ role + แท็บ, mobile-first): `/admin` ตัวเลข 4 ใบ (คิว/รายงานค้างเน้นสีทอง), `/admin/moderation` คิวเก่าสุดก่อน เห็นรูปทุกใบ+รายละเอียดเต็ม+ข้อมูลผู้ขาย, `/admin/users` ค้นหา+verify+ban, `/admin/reports` ลิงก์ไปประกาศ+ตรวจแล้ว+ปิดประกาศทันที, `/admin/listings` ค้นหา+ตั้ง/ถอดประกาศเด่น
- **ระบบแบน**: เช็คใน Credentials authorize + OAuth signIn callback (ล็อกอินไม่ได้) + createListingAction (ลงประกาศไม่ได้) — session เก่าที่ยังไม่หมดอายุ (JWT) จะยังใช้ได้จนหมด maxAge เป็นข้อจำกัดที่รับได้ใน MVP
- **Loop เหตุผล reject**: ผู้ขายเห็นเหตุผลใน dashboard + แก้ไขประกาศที่โดน reject → กลับเข้าคิว PENDING อัตโนมัติ (เคลียร์เหตุผลเดิม)
- ทุก action revalidate หน้า public ที่เกี่ยว (`/admin` layout + `/listings` + หน้าประกาศ)

### ทดสอบแล้ว (E2E เต็ม flow เกณฑ์ตรวจรับ)

- [x] **Flow ครบวงจร:** test-seller (ไม่ verified) ลงประกาศเมล่อน → PENDING → admin เห็นในคิว (6 รายการ) → approve → ขึ้น `/listings` จริง → มีคน report "หลอกลวง" → admin กด "ปิดประกาศทันที" จากหน้ารายงาน → หายจากหน้าเว็บ + ผู้ขายเห็นเหตุผลใน dashboard
- [x] reject พร้อมเหตุผล → ผู้ขายเห็นข้อความเหตุผล
- [x] **verify user → ประกาศถัดไปของเขาขึ้น ACTIVE ทันที** (ไม่เข้าคิว)
- [x] ban → ล็อกอินด้วยรหัสถูกก็เข้าไม่ได้
- [x] ตัวเลข dashboard ถูกทุกใบ, ค้นหา user ทำงาน, featured toggle เปลี่ยน badge จริง
- [x] `npm run build` ผ่าน — ข้อมูลทดสอบล้างหมด (DB = seed 20 รายการ, PENDING 5)

---

## M6: หน้าสาธารณะ — รวมประกาศ + ประกาศรายตัว ✅ (2026-07-07)

### สิ่งที่ทำ

- **`/listings`**: grid การ์ด (รูป 4:3 → ชื่อ → ป้ายราคาทอง → จังหวัด+เวลา) + filter หมวด/จังหวัด/ช่วงราคา + เรียง (ใหม่สุด/ถูกสุด) + pagination — filter เป็น **form GET ล้วน ทำงานได้โดยไม่ต้องมี JS** (เน็ตช้า/เครื่องเก่า)
- **`/listings/[slug]`**: ISR `revalidate=300` + on-demand จาก actions, gallery แตะสลับรูป, ป้ายราคาใหญ่, ผู้ขาย+badge ยืนยัน, **ปุ่มโทร (กด "แสดงเบอร์" ก่อน — กัน scraping) + LINE sticky ล่างจอมือถือ (สูง 48px)**, ปุ่มรายงาน (dialog, ไม่บังคับล็อกอิน, กันรายงานซ้ำ/วัน), ประกาศใกล้เคียง 4 (หมวดเดียวกัน จังหวัดเดียวกันก่อน), view counter (sendBeacon → `/api/listings/[id]/view`, กันซ้ำด้วย sessionStorage), คำเตือนความปลอดภัยผู้ซื้อ
- **ค้นหา**: pg_trgm extension + GIN index บน title/description → Prisma `contains insensitive` (ILIKE ใช้ index นี้) — เลือกทางนี้แทน tsvector เพราะ FTS ของ Postgres ตัดคำไทยไม่ได้ (ไม่มีช่องว่าง) แต่ trigram จับ substring ไทยได้ดี
- **SEO**: JSON-LD `Product`+`Offer`, title ตาม pattern §9, OG image = รูปแรก, แก้ title ซ้ำ "| KasetMarket" ทุกหน้า (layout มี template อยู่แล้ว)
- Public queries ทุกตัว filter `ACTIVE` + `expiresAt > now` (ประกาศเลยอายุแต่ยังไม่มี cron เปลี่ยนสถานะ → ไม่โชว์)
- คอมโพเนนต์ใหม่ใน `features/listings/components/`: price-tag (signature element), listing-card, listing-filters, listing-pagination, listing-gallery, contact-buttons, view-tracker + `features/moderation/`: report-button

### ทดสอบแล้ว (E2E)

- [x] Filter ทุกคอมโบถูก: หมวด (2), ค้นหาไทย "ทุเรียน" (1 — REJECTED ไม่โชว์), เรียงถูกสุด, จังหวัด+ราคาขั้นต่ำ, ไม่พบผลลัพธ์
- [x] แสดงเบอร์ 2 จังหวะ → `tel:` จริง, LINE → line.me, sticky bar ชิดล่างพอดีบนมือถือ 375px, report → ลง DB จริง
- [x] JSON-LD + title pattern + gallery + ประกาศใกล้เคียง แสดงครบ
- สิ่งที่ยังไม่ได้วัด: Lighthouse mobile ≥85 (เกณฑ์ M6) — ควรวัดตอน deploy จริงบน Vercel (dev server วัดไม่ตรง)

### Next step (M8 — บทความ + CMS)

- `/admin/articles` CMS (Markdown + preview + รูปปก + publish), `/articles` + `[slug]` (ISR 1 ชม., JSON-LD Article, บทความเกี่ยวข้อง, CTA ไปหมวดประกาศ)
- **งานของคุณ:** คัดสคริปต์ YouTube 15-20 เรื่องที่จะแปลงเป็นบทความ (Claude ช่วยแปลงได้) + งานค้างเดิม (LINE/Google port 3000, R2)

---

## M5: ลงประกาศ + จัดการประกาศ (Seller core) ✅ (2026-07-07)

### สิ่งที่ทำ

- `features/listings/` ครบวงจร: `schemas.ts` (zod + `listingFormDataToObject`), `actions.ts` (create/update/markSold/renew/delete — ทุกตัวตรวจ session + ownership), `queries.ts`, `components/` (listing-form, listing-row-actions, listing-status-badge + image-uploader จาก M4)
- ฟอร์ม `/dashboard/listings/new` + `/dashboard/listings/[id]/edit` (ฟอร์มเดียวใช้ร่วม 2 โหมด): รูป ≤6, ชื่อ, รายละเอียด, ราคา+หน่วย, ต่อรองได้, หมวด, จังหวัด (จัดกลุ่มตามภาค)/อำเภอ, เบอร์โทร+LINE — **บังคับช่องทางติดต่ออย่างน้อย 1 อย่าง**, บังคับรูปอย่างน้อย 1 รูป, เบอร์โทร prefill จากโปรไฟล์
- `/dashboard/listings`: การ์ดประกาศ (thumbnail, ป้ายราคา/หน่วย, สถานะ, วิว, วันหมดอายุ) + ปุ่ม แก้ไข/ขายแล้ว/ต่ออายุ/ลบ (confirm ก่อนลบ/ปิดขาย), ปุ่ม "ขายแล้ว" แสดงเฉพาะสถานะ ACTIVE/PENDING
- Logic ตามกติกา §8: verified → ACTIVE / ไม่ verified → PENDING (+ ข้อความบอกผู้ขายชัดเจนว่ารอตรวจ), expiresAt +30 วัน, ต่ออายุจาก EXPIRED กลับเป็น ACTIVE (verified) หรือ PENDING, **rate limit 5 ประกาศ/วัน** (นับตามวันปฏิทินเวลาไทย UTC+7)
- แก้ไข: แทนที่รูปทั้งชุดตามลำดับใหม่ (`deleteMany` + `create`), สถานะคงเดิม
- Slug ไทยผ่าน `generateSlug` + retry 3 ครั้งถ้าชน (P2002)
- ImageUploader รองรับ `initial` (โหมดแก้ไข), ลบหน้า `upload-demo` ชั่วคราวของ M4, dashboard home เป็นปุ่มลัด 2 ใบ

### ทดสอบแล้ว (E2E บน browser จริง)

- [x] admin (verified) ลงประกาศ → ACTIVE ทันที + แสดงในรายการพร้อมป้ายราคา "13,900 บาท/ตัน" หมดอายุ +30 วัน
- [x] test-seller (ไม่ verified) ลงประกาศ → PENDING + ข้อความรอตรวจ
- [x] ไม่ใส่ช่องทางติดต่อ → โดน validate, แก้ไขราคา → อัปเดตจริง, ขายแล้ว → badge เปลี่ยน+ปุ่มหาย, EXPIRED → ต่ออายุ → กลับ ACTIVE, ลบ → หายจริง
- [x] ประกาศที่ 6 ในวันเดียว → โดนบล็อกพร้อมข้อความ
- [x] slug ไทยถูก pattern, `npm run build` ผ่าน
- ข้อมูลทดสอบลบหมดแล้ว (DB กลับเป็น seed 20 รายการ)

### Next step (M6 — หน้าสาธารณะ)

- `/listings` grid + filter (หมวด/จังหวัด/ราคา) + เรียง + pagination, `/listings/[slug]` (gallery, ป้ายราคาใหญ่, ปุ่มโทร/LINE sticky, แสดงเบอร์เมื่อกด, รายงาน, ใกล้เคียง 4, view counter), FTS + pg_trgm, JSON-LD, ISR 300s + on-demand revalidate — ตอนนั้นค่อยเพิ่ม `revalidatePath`/`revalidateTag` ใน actions M5
- งานผู้ใช้ค้างเดิม: ทดสอบ LINE/Google บน port 3000, ใส่ R2 credentials

---

## M4: Image upload ✅ (2026-07-07) — local driver ไปก่อน, R2 พร้อมเสียบ

### สิ่งที่ทำ

- **Storage layer สลับ driver อัตโนมัติ** (`src/lib/storage.ts`): ถ้า `.env` มี R2 ครบ 5 ค่า → presigned URL ไป Cloudflare R2 (aws4fetch, S3 SigV4) / ถ้าไม่มี → **local driver** เก็บลง `.uploads/` (gitignored) — flow ฝั่ง client เหมือนกันทุกประการ ใส่ R2 credentials เมื่อไหร่ก็สลับเองไม่ต้องแก้โค้ด
- API: `POST /api/upload` (ต้องล็อกอิน, zod validate: webp/jpeg/png ≤5MB) → คืน `{uploadUrl, publicUrl, key}` · `PUT /api/upload/local` (ตรวจ HMAC token + expiry เลียนแบบ presigned, กัน path traversal) · `GET /api/uploads/[...path]` เสิร์ฟรูป local
- **Client-side compress** (`src/lib/image-compress.ts`): max 1600px, webp q0.8 (fallback jpeg), หมุนตาม EXIF อัตโนมัติ
- **`<ImageUploader>`** (`features/listings/components/`): สูงสุด 6 รูป, progress bar ต่อรูป, ลบ, เรียงลำดับ (ลาก + ปุ่มลูกศรสำหรับมือถือ), badge "รูปปก" ที่รูปแรก, `onChange` ส่ง `{key, url}[]` — พร้อมเสียบฟอร์มลงประกาศ M5
- `next.config.ts`: อนุญาต `*.r2.dev` + โฮสต์จาก `R2_PUBLIC_BASE_URL` + picsum (seed)
- หน้า `/dashboard/upload-demo` (ชั่วคราว — ลบตอน M5 เมื่อฟอร์มจริงมาแทน)

### ทดสอบแล้ว (E2E บน browser จริง, local driver)

- [x] รูป jpeg 1.3MB (2400×1800) → บีบเหลือ **164-180KB webp** (เกณฑ์ <500KB ผ่านขาด)
- [x] อัป 2 รูปพร้อมกัน → เห็น URL + thumbnail + ไฟล์ลงดิสก์จริง, GET กลับมาเป็น image/webp + immutable cache
- [x] เรียงลำดับ / ลบ / badge รูปปก ทำงานถูก
- [x] Security: POST ไม่ล็อกอิน → 401, PUT token ปลอม → 403, path traversal → 404
- [x] `npm run build` ผ่าน
- [ ] **ยังไม่ได้ทดสอบกับ R2 จริง + มือถือจริง 6 รูป** — รอ credentials (ดู Next step)

### ติดอะไร / บทเรียน

- **ห้ามรัน `npm run build` ขณะ dev server เปิดอยู่** — ทั้งคู่เขียน `.next/` ทับกัน dev server พัง (ต้อง restart) เจอแล้วครั้งหนึ่ง
- `next.config.ts` แก้แล้วต้อง restart dev server เสมอ (ไม่ hot-reload)

### Next step (M5 — ลงประกาศ + จัดการประกาศ) + งานผู้ใช้

- **งานของคุณ (เมื่อกลับจากเดินทาง):** (1) ทดสอบ LINE/Google login บน port 3000 (ค้างจาก M3) (2) สมัคร Cloudflare R2 → สร้าง bucket → เปิด public access (r2.dev หรือ custom domain) → ใส่ 5 ค่าใน `.env` ตามคอมเมนต์ใน `.env.sample` → ลองอัปรูปจากมือถือจริง 6 รูปที่ `/dashboard/upload-demo`
- M5 เริ่มได้เลยไม่ต้องรอ R2: ฟอร์มลงประกาศ (zod + Server Action), แก้ไข/SOLD/ต่ออายุ/ลบ, กติกา verified→ACTIVE / ไม่ verified→PENDING, rate limit 5 ประกาศ/วัน

---

## M3: Auth — LINE + Email/รหัสผ่าน + Google ✅ (2026-07-07)

### สิ่งที่ทำ

- **Auth.js v5 (next-auth 5.0.0-beta.31)** + Prisma adapter + JWT session (จำเป็นเพราะใช้ Credentials provider ร่วม)
- 3 ช่องทางล็อกอิน: **LINE (หลัก)** + **Google** + **Email/รหัสผ่าน** (bcryptjs, hash rounds 12)
- Schema: `User` เพิ่ม `email`/`emailVerified`/`passwordHash`, เปลี่ยน `avatarUrl` → `image` (ตามที่ Auth.js adapter ต้องการ), เพิ่ม model `Account` (OAuth linking) — migration `20260707134236_add_auth`
- โครงสร้างตาม §4: ทุกอย่างอยู่ `features/auth/` — `auth.ts` (NextAuth instance), `config.ts` (edge-safe สำหรับ middleware — **ห้าม import prisma ในไฟล์นี้**), `schemas.ts` (zod), `actions.ts` (register/login/oauth/logout), `components/` (ฟอร์ม + ปุ่ม OAuth)
- `src/middleware.ts` กัน `/dashboard/*` (ต้องล็อกอิน) + `/admin/*` (ต้อง ADMIN, non-admin เด้งไป /dashboard) — role เก็บใน JWT ผ่าน `jwt`/`session` callbacks
- หน้า `/login` (LINE เด่นบนสุด → Google → email form), `/register`, โครงหน้า `/dashboard` + `/admin` (เนื้อหาจริง M5/M7) พร้อมปุ่มออกจากระบบ
- โครง phone OTP อยู่หลัง `FLAGS.PHONE_OTP` (ปิด) ตามแผน
- Seed: admin มี login ทดสอบ `admin@kasetmarket.dev` / `admin1234` (dev เท่านั้น)
- Header ยังเป็นลิงก์ /login แบบ static **โดยตั้งใจ** — ไม่เรียก `auth()` ใน layout เพราะจะทำให้หน้า public ทุกหน้ากลายเป็น dynamic เสีย ISR (ค่อยทำ session-aware header ด้วย client component ทีหลัง)

### ทดสอบแล้ว (E2E ผ่าน browser จริง)

- [x] เข้า `/dashboard` โดยไม่ล็อกอิน → เด้ง `/login?callbackUrl=...`
- [x] สมัครด้วยอีเมล → auto-login → เข้า `/dashboard` แสดงชื่อ
- [x] SELLER เข้า `/admin` → โดนเด้งกลับ `/dashboard`
- [x] รหัสผ่านผิด → error ภาษาไทย, ล็อกอิน admin → เข้า `/admin` ได้
- [x] ล็อกอินค้างอยู่แล้วเปิด `/login` → เด้งไป `/dashboard`, ออกจากระบบ → กลับหน้าแรก
- [x] `npm run build` ผ่าน (หน้าแรกยัง Static ○, login/register/dashboard/admin เป็น Dynamic ƒ)
- [ ] **LINE / Google OAuth ยังไม่ได้ทดสอบจริง** — ต้องรันบน port 3000 (callback URL ผูกไว้) — ดู Next step

### ติดอะไร / ตัดสินใจอะไร

- `prisma migrate dev` ใช้ไม่ได้ใน shell non-interactive → ใช้ `prisma migrate diff` สร้าง SQL เอง + `migrate deploy` แทน (ทำแบบนี้ได้อีกถ้าเจอ)
- ตอนทดสอบ port 3000 ถูก dev server ของโปรเจ็ค **ShopDash** ใช้อยู่ → เพิ่ม `autoPort: true` ใน `.claude/launch.json` (dev รันที่ port อื่นได้ แต่ **ทดสอบ OAuth ต้องปิด ShopDash แล้วรันที่ 3000 เท่านั้น**)
- user ทดสอบ `test-seller@example.com` / `testpass123` ค้างอยู่ใน DB (ลบได้ด้วย prisma studio หรือรัน seed ใหม่)

### Next step (M4 — R2 image upload) + งานผู้ใช้

- **งานของคุณ:** (1) ทดสอบ LINE + Google login จริง: ปิด ShopDash dev server → `npm run dev` → เปิด `http://localhost:3000/login` กดปุ่ม LINE และ Google (2) สมัคร Cloudflare R2 → สร้าง bucket `kasetmarket-images` → เอา credentials ใส่ `.env` (H0.5)
- M4: R2 client ใน `lib/`, API route อัปโหลด (presigned/proxy), client-side resize ก่อนอัป, ผูกกับ next/image

---

## M2: Database Schema + Seed ✅ (2026-07-07)

### สิ่งที่ทำ

- **Prisma 6.19.3** + `prisma/schema.prisma` ครบทุก model ตาม CLAUDE.md §5: `User`, `Listing`, `ListingImage`, `Article`, `Report` + enum `Role`, `ListingStatus`
- Migration แรก `20260707054347_init` apply กับ Neon แล้ว
- `src/lib/prisma.ts` — PrismaClient singleton (กัน hot reload สร้าง connection ซ้ำ)
- `prisma/seed.ts` (รันด้วย `npx prisma db seed` ผ่าน tsx): admin 1, seller 3 (verified 2 + unverified 1), ประกาศ 20 กระจายครบ 10 หมวด × หลายจังหวัด (ACTIVE 13 / PENDING 5 / SOLD 1 / REJECTED 1, featured 3), รูป placeholder จาก picsum.photos 32 รูป, บทความ 3 เรื่อง (published)
- Seed ลบข้อมูลเก่าก่อนเสมอ (รันซ้ำได้) และ implement กติกา "seller ไม่ verified → PENDING" ตั้งแต่ใน seed

### การตัดสินใจระหว่างทาง

1. **Pin Prisma 6** (ไม่ใช้ 7 ที่เป็น latest) — Prisma 7 เปลี่ยน generator/config/driver adapter ยกชุด ยัง breaking กับ pattern เดิม; ค่อยพิจารณา upgrade หลัง MVP
2. **Neon pooled URL ต้องมี `pgbouncer=true&connect_timeout=15`** (ใส่ใน `.env` + `.env.sample` แล้ว) — PgBouncer transaction mode ไม่รองรับ prepared statements ของ Prisma; ส่วน migrate ใช้ `directUrl`
3. เพิ่ม relation จริง `Report ↔ Listing` (spec เดิมมีแค่ `listingId` string) + `onDelete: Cascade`/`SetNull` — admin M7 ต้องลิงก์จากรายงานไปประกาศ
4. Schema เพิ่ม `@@index([listingId])` บน ListingImage และ `@@index([resolved, createdAt])` บน Report

### เกณฑ์ตรวจรับที่ผ่านแล้ว

- [x] ข้อมูล seed ครบใน DB (ตรวจด้วย query จริง: users 4, listings 20, images 32, articles 3) — ดูผ่าน `npx prisma studio` ได้
- [x] `npm run build` ผ่าน

### Next step (M3 — Auth)

- Auth.js v5 + LINE provider + Google provider + Credentials (email/รหัสผ่าน) + Prisma adapter, หน้า `/login` + `/register`, middleware กัน `/dashboard/*` + `/admin/*`, โครง phone OTP หลัง flag
- **เปลี่ยนจากแผนเดิม (2026-07-07):** ผู้ใช้ขอเพิ่มช่องทางสำหรับคนไม่มี LINE ตั้งแต่ MVP — เลือก Email/รหัสผ่าน + Google Login แทนที่จะเร่ง phone OTP (มีต้นทุน SMS) รายละเอียดดู CLAUDE.md §2 และ PLAN.md M3
- **งานของคุณก่อน M3:**
  - LINE: สมัคร LINE Developers → สร้าง LINE Login channel → เอา `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET` ใส่ `.env` + ตั้ง callback `http://localhost:3000/api/auth/callback/line` (H0.4)
  - Google: สร้าง OAuth credentials ที่ Google Cloud Console → เอา `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` ใส่ `.env` + ตั้ง redirect URI `http://localhost:3000/api/auth/callback/google`
  - `AUTH_SECRET`: รัน `npx auth secret` แล้ววางค่าใน `.env`

---

## M1: Project Scaffold + Design Tokens ✅ (2026-07-07)

### สิ่งที่ทำ

- **Scaffold:** Next.js **15.5.20** (App Router, Turbopack) + TypeScript + Tailwind **v4** + ESLint, โครงสร้าง `src/` + import alias `@/*`
- **shadcn/ui:** init ด้วย CLI ใหม่ (base: radix, preset: nova) + components: `button, card, input, dialog, badge, label, select, textarea` ใน `src/components/ui/`
- **Design tokens** (`src/app/globals.css`) ตาม CLAUDE.md §3 ครบ: surface `#F7F8F4`, primary `#1E7A46`, primary-dk `#14522F`, gold `#E8A317`, text `#22301F`, muted `#6B7A64`, danger `#C0392B`
  - ⚠️ **Naming ที่ตัดสินใจ:** สีทองข้าวเปลือกใช้ชื่อ token **`--accent-gold`** (utility: `bg-accent-gold`, `text-accent-gold-foreground`) — ไม่ใช้ `--accent` ตรงๆ เพราะชนกับ semantic ของ shadcn ที่ใช้ `--accent` เป็นสี hover อ่อนใน dropdown/menu
- **ฟอนต์** ผ่าน `next/font/google` — variables ประกาศบน `<html>`: Anuphan (`--font-anuphan` → `font-heading`, ผูก h1-h6 อัตโนมัติ), IBM Plex Sans Thai Looped (`--font-plex-thai` → `font-sans`, body), IBM Plex Sans (`--font-plex-sans` → `font-num`, ใช้กับราคา + `tabular-nums`)
- **โครง folder ตาม §4:** `app/(public)`, `app/(auth)`, `app/dashboard`, `app/admin`, `app/api` (`.gitkeep`), `features/{listings,articles,auth,moderation,search}/index.ts`
- **Config (ค่าคงที่ธุรกิจ):** `config/categories.ts` (10 หมวด), `config/units.ts` (10 หน่วย), `config/provinces.ts` (77 จังหวัด + 6 ภูมิภาค), `config/flags.ts` (PHONE_OTP ฯลฯ ปิดไว้)
- **Utilities:** `lib/format.ts` (ปรับจาก ShopDash: `formatPrice`, `formatPricePerUnit`, `formatThaiDate`, `formatThaiDateTime`, `formatTimeAgo`), `lib/slug.ts` (slug ไทย + random suffix)
- **Layout:** `SiteHeader` (โลโก้ + nav + ปุ่มล็อกอิน/ลงประกาศ ชี้ `/login` ชั่วคราว, nav แยกแถวบนมือถือ), `SiteFooter` (เขียวเข้ม + ลิงก์หน้า static ที่จะมาใน M9)
- **หน้าแรก placeholder** (`app/(public)/page.tsx`): hero + chips หมวดหมู่จาก config + การ์ดประกาศตัวอย่าง 4 ใบ โชว์**ป้ายราคาต่อหน่วยกรอบทอง** (signature element)

### การตัดสินใจระหว่างทาง (ต่างจากสเปคเดิม)

1. **ShopDash reuse:** `_shopdash-reuse/` เป็นโปรเจ็คเต็ม **ไม่มี `components/ui/`** ตามที่ CLAUDE.md §7 คาด → ติดตั้ง shadcn/ui สดแทน, ยกมาเฉพาะ `lib/format.ts` (ปรับใหม่), ส่วน `lib/upload-client.ts` + `lib/r2.ts` เก็บไว้ใช้ตอน M4
2. `_shopdash-reuse/` ถูก **gitignore + exclude จาก tsconfig/eslint** (มี `.env.local` ของโปรเจ็คเก่า ห้าม commit / ห้าม build ไปโดน)
3. Rename branch `master` → `main`
4. Tailwind v4: token ประกาศใน `:root` + map ผ่าน `@theme inline` (ไม่มี tailwind.config.js — เป็น default ของ v4)

### เกณฑ์ตรวจรับที่ผ่านแล้ว

- [x] `npm run build` ผ่าน (0 type error, 0 lint error)
- [x] หน้าแรกแสดงฟอนต์ไทย (Anuphan หัวข้อ / IBM Plex Sans Thai Looped body / IBM Plex Sans ตัวเลขราคา) — ตรวจจาก computed styles จริง
- [x] สีตรง token ทุกจุด (ตรวจ computed: bg `#F7F8F4`, ปุ่ม `#1E7A46`, กรอบราคา `#E8A317`)
- [x] มือถือ 375px: ไม่มี horizontal overflow, header/footer ไม่พัง, ปุ่มหลักสูง ≥ 44px

### ปัญหาที่เจอ + วิธีแก้

- Build แรก fail เพราะ TypeScript ไปเช็ค `_shopdash-reuse/` → แก้ด้วย `exclude` ใน tsconfig + ignore ใน eslint config
- ฟอนต์ body ไม่ติด (Times New Roman) เพราะ font variables อยู่บน `<body>` แต่ `font-sans` apply ที่ `<html>` → ย้าย variables ขึ้น `<html>`
- Header ล้นจอ 375px (383px) → ลด gap/padding บนมือถือ + ซ่อน "+" ในปุ่มลงประกาศ

### Next step (M2)

- Prisma schema ครบทุก model ตาม CLAUDE.md §5 + migrate + seed (admin 1, seller 3, ประกาศ 20, บทความ 3) + `lib/prisma.ts`
- **งานของคุณก่อนเริ่ม M2:** ใส่ `DATABASE_URL` ใน `.env` (Neon หรือ Supabase — H0.2)
