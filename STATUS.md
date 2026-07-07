# STATUS.md — KasetMarket

> อัปเดตหลังจบทุก milestone — session ใหม่อ่านไฟล์นี้คู่กับ CLAUDE.md + PLAN.md

- **Milestone ปัจจุบัน:** M3 เสร็จแล้ว ✅ — พร้อมเริ่ม M4 (Image upload: Cloudflare R2)
- **อัปเดตล่าสุด:** 2026-07-07

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
