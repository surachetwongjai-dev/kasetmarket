# PLAN.md — แผนสร้าง KasetMarket ด้วย Claude Code (Opus 4.8)

> ใช้คู่กับ CLAUDE.md — วางทั้งสองไฟล์ที่ root ของ repo
> กติกา: 1 milestone = 1 session (หรือ 1 ก้อนงาน) → build ผ่าน → ทดสอบตามเกณฑ์ → `git commit` → ค่อยไปต่อ
> ห้ามข้าม milestone ห้ามทำ 2 milestone พร้อมกัน

## วิธีสั่งงานแต่ละ milestone

เปิด Claude Code แล้วสั่งตามแพทเทิร์นนี้:

```
อ่าน CLAUDE.md และ PLAN.md แล้วทำ Milestone X เท่านั้น
ห้ามทำเกิน scope ของ milestone นี้
เสร็จแล้ว: รัน npm run build ให้ผ่าน, สรุปสิ่งที่ทำ, อัปเดต STATUS.md
```

ถ้า context ใกล้เต็มระหว่าง milestone: สั่งให้สรุปงานลง STATUS.md ก่อน แล้วเปิด session ใหม่

---

## Phase 0 — เตรียมการ (งานของคุณ ทำก่อนเริ่ม)

- [ ] **H0.1** สร้าง repo ใหม่บน GitHub ชื่อ `kasetmarket`
- [ ] **H0.2** สมัคร/เตรียม PostgreSQL — แนะนำ Neon (free tier) หรือ Supabase → เก็บ `DATABASE_URL`
- [ ] **H0.3** สร้างบัญชี Cloudflare R2 → สร้าง bucket `kasetmarket-images` → เก็บ Access Key + Secret + Endpoint
- [ ] **H0.4** สมัคร LINE Developers → สร้าง LINE Login channel → เก็บ Channel ID + Secret (callback URL ใส่ทีหลังตอน M3)
- [ ] **H0.5** คัดไฟล์จาก ShopDash ที่จะยกมา ใส่โฟลเดอร์ `_shopdash-reuse/` ใน repo (components/ui, upload utils, format utils)

---

## Milestone 1 — Project Scaffold + Design Tokens

**เป้า:** โปรเจ็ค Next.js รันได้ พร้อมระบบดีไซน์ครบ

**สั่งให้ทำ:**
- สร้าง Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- ตั้ง design tokens ตาม CLAUDE.md section 3 (สี, ฟอนต์ Anuphan + IBM Plex Sans Thai Looped ผ่าน next/font/google)
- โครง folder ตาม CLAUDE.md section 4 (สร้างโฟลเดอร์เปล่า + index ไฟล์)
- สร้าง `config/categories.ts`, `config/units.ts`, `config/provinces.ts` (77 จังหวัด + ภูมิภาค), `config/flags.ts`
- ย้าย components จาก `_shopdash-reuse/` เข้า `components/ui/` ปรับสีตาม tokens ใหม่
- Layout หลัก: header (โลโก้ + ปุ่มลงประกาศ + ล็อกอิน), footer, responsive
- สร้าง `STATUS.md`

**เกณฑ์ตรวจรับ:**
- `npm run dev` เปิดหน้าแรก (placeholder) เห็นฟอนต์ไทย + สีถูกต้อง
- `npm run build` ผ่าน
- เปิดบนมือถือ (หรือ DevTools mobile) header/footer ไม่พัง

**Commit:** `M1: scaffold + design system`

---

## Milestone 2 — Database Schema + Seed

**เป้า:** Prisma schema ครบ + ข้อมูลทดสอบ

**สั่งให้ทำ:**
- Prisma schema ตาม CLAUDE.md section 5 ครบทุก model
- `npx prisma migrate dev`
- Seed script: admin user 1 คน, seller ทดสอบ 3 คน, ประกาศตัวอย่าง 20 รายการ (กระจายหมวด/จังหวัด, ใช้รูป placeholder), บทความตัวอย่าง 3 เรื่อง
- `lib/prisma.ts` (singleton client)

**งานของคุณ:** ใส่ `DATABASE_URL` ใน `.env`

**เกณฑ์ตรวจรับ:**
- `npx prisma studio` เห็นข้อมูล seed ครบ
- Build ผ่าน

**Commit:** `M2: schema + seed`

---

## Milestone 3 — Auth (LINE Login + Email/รหัสผ่าน + Google Login)

> **อัปเดตหลัง M2 (ตัดสินใจร่วมกับผู้ใช้):** เดิม M3 มีแผนสำรองเป็น "เบอร์โทร OTP" แต่ปิดไว้เพราะมีต้นทุนค่า SMS ต่อครั้ง (เปิดจริง Phase 2) — ผู้ใช้ต้องการช่องทางสำหรับคนที่ไม่มี LINE ตั้งแต่ MVP จึงเปลี่ยนมาใช้ **Email/รหัสผ่าน** และ **Google Login** แทน เพราะไม่มีต้นทุนต่อการใช้งาน ดูรายละเอียดใน CLAUDE.md §2

**เป้า:** สมัคร/ล็อกอินได้จริงด้วย LINE (หลัก), Email/รหัสผ่าน และ Google (สำรองสำหรับคนไม่มี LINE)

**สั่งให้ทำ:**
- Auth.js v5 + LINE provider + Google provider + Credentials provider (email/password) + Prisma adapter
- เพิ่ม field `email` (unique, nullable) + `passwordHash` (nullable) ใน `User` model + migrate
- หน้า `/login` + `/register` — ปุ่ม "เข้าสู่ระบบด้วย LINE" เด่นสุด, ปุ่ม Google, ฟอร์ม email/รหัสผ่านสำรอง
- Hash รหัสผ่านด้วย `bcrypt`, validate ด้วย zod
- Session มี `user.id`, `user.role`
- Middleware ป้องกัน `/dashboard/*` (ต้องล็อกอิน) และ `/admin/*` (ต้อง ADMIN)
- โครง phone OTP ไว้หลัง feature flag `PHONE_OTP` (ปิดไว้ก่อน — ค่า SMS มีต้นทุน เปิด Phase 2)
- **ยังไม่ทำ:** ส่งอีเมลยืนยันตัวตน/ลืมรหัสผ่านทางอีเมลจริง (ต้องมี email service เพิ่ม — เป็นงานเสริมนอก M3 นี้)

**งานของคุณ:**
- LINE: ใส่ callback URL ใน LINE Developers console: `https://<domain>/api/auth/callback/line` (dev ใช้ `http://localhost:3000/...`) + ใส่ `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET` ใน `.env`
- Google: สร้าง OAuth consent screen + credentials ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (dev) → ใส่ `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` ใน `.env`
- ใส่ `AUTH_SECRET` ใน `.env` (`npx auth secret`)
- ทดสอบล็อกอินทั้ง 3 ช่องทาง แล้วแก้ role ตัวเองใน Prisma studio เป็น `ADMIN`

**เกณฑ์ตรวจรับ:**
- ล็อกอินสำเร็จทั้ง LINE, Google, และ Email/รหัสผ่าน, เข้า `/dashboard` ได้, คนไม่ล็อกอินโดนเด้งไป `/login`
- `/admin` เข้าได้เฉพาะ ADMIN

**Commit:** `M3: auth`

---

## Milestone 4 — ระบบอัปโหลดรูป (R2)

**เป้า:** อัปรูปจากมือถือได้ เร็ว ไฟล์ไม่ใหญ่

**สั่งให้ทำ:**
- Client-side resize/compress ก่อนอัป (max 1600px, quality ~0.8, แปลง webp)
- Presigned URL upload ไป R2 (route handler `/api/upload`)
- จำกัด: 6 รูป/ประกาศ, ไฟล์ละไม่เกิน 5MB หลัง compress
- Component `<ImageUploader>` — ลากเรียงลำดับ, ลบรูป, แสดง progress
- `next.config` อนุญาต R2 domain สำหรับ next/image

**งานของคุณ:** ใส่ R2 credentials ใน `.env`, ตั้ง public access หรือ custom domain ให้ bucket

**เกณฑ์ตรวจรับ:**
- อัปรูปจากมือถือจริง 6 รูปสำเร็จ เห็นรูปแสดงผ่าน next/image
- รูป 5MB จากกล้องมือถือถูกบีบเหลือ < 500KB

**Commit:** `M4: image upload`

---

## Milestone 5 — ลงประกาศ + จัดการประกาศ (Seller core)

**เป้า:** ผู้ขายลงประกาศและจัดการเองได้ครบวงจร

**สั่งให้ทำ:**
- ฟอร์มลงประกาศ `/dashboard/listings/new`: ชื่อ, รายละเอียด, ราคา + หน่วย (dropdown จาก config), ต่อรองได้, หมวด, จังหวัด/อำเภอ, รูป, เบอร์โทร, LINE ID — validate ด้วย zod ทั้ง client + server action
- Slug generator ภาษาไทย: `ขายข้าวหอมมะลิ-สุรินทร์-x7f2`
- Logic สถานะ: user ไม่ verified → PENDING, verified → ACTIVE, expiresAt +30 วัน
- `/dashboard/listings`: ตารางประกาศตัวเอง — แก้ไข / ปิดการขาย / ต่ออายุ / ลบ + ยอดวิว
- Rate limit 5 ประกาศ/วัน/user

**เกณฑ์ตรวจรับ:**
- ลงประกาศจากมือถือจบใน ≤ 3 นาที ไม่ติดขัด
- แก้ไข/ปิดการขาย/ต่ออายุ ทำงานถูก, ลงประกาศที่ 6 ในวันเดียวโดนบล็อก

**Commit:** `M5: seller listings CRUD`

---

## Milestone 6 — หน้าสาธารณะ: รวมประกาศ + ประกาศรายตัว

**เป้า:** ผู้ซื้อดู ค้นหา และติดต่อผู้ขายได้ — หัวใจของเว็บ

**สั่งให้ทำ:**
- `/listings`: grid การ์ดประกาศ (รูป 4:3, ชื่อ, ป้ายราคา/หน่วยสีทอง, จังหวัด, เวลา) + filter หมวด/จังหวัด/ช่วงราคา + เรียงลำดับ + pagination — Server Component, filter ผ่าน searchParams
- `/listings/[slug]`: gallery, รายละเอียด, ป้ายราคาใหญ่, ข้อมูลผู้ขาย + badge verified, **ปุ่มโทร + LINE แบบ sticky ล่างจอบนมือถือ**, ปุ่ม "แสดงเบอร์" (กดก่อนถึงเห็น), ปุ่มรายงานประกาศ, ประกาศใกล้เคียง 4 รายการ, view counter
- ISR: หน้าประกาศ revalidate 300s + on-demand revalidate เมื่อผู้ขายแก้
- ค้นหาข้อความ: Postgres FTS + pg_trgm บน title/description
- JSON-LD Product/Offer + OG meta ทุกหน้าประกาศ
- แสดงเฉพาะ `status: ACTIVE` เสมอ

**เกณฑ์ตรวจรับ:**
- Filter + ค้นหา + แบ่งหน้า ทำงานถูกทุกคอมโบ
- กดปุ่มโทรบนมือถือ → เปิด dialer, กดปุ่ม LINE → เปิดแอป LINE
- Lighthouse mobile หน้า listing ≥ 85 performance

**Commit:** `M6: public listings`

---

## Milestone 7 — Admin: Moderation + จัดการ user

**เป้า:** คุณควบคุมคุณภาพแพลตฟอร์มได้จากมือถือ

**สั่งให้ทำ:**
- `/admin`: dashboard ตัวเลข — ประกาศรออนุมัติ, ประกาศใหม่วันนี้, user ใหม่, รายงานค้าง
- `/admin/moderation`: คิว PENDING — ดูรูป+รายละเอียดเต็ม, Approve / Reject พร้อมเหตุผล (เหตุผลแสดงให้ผู้ขายเห็นใน dashboard)
- `/admin/users`: list + ค้นหา, ปุ่ม Verify (ให้ badge), Ban/Unban
- `/admin/reports`: รายการรายงาน + ลิงก์ไปประกาศ + mark resolved + ปุ่มปิดประกาศทันที
- ปุ่มตั้ง/ถอด featured บนประกาศใดก็ได้
- ทุกหน้า admin ใช้ได้ดีบนมือถือ (คุณจะกดอนุมัติจากมือถือบ่อย)

**เกณฑ์ตรวจรับ:**
- Flow ครบ: user ใหม่ลงประกาศ → PENDING → admin approve → ขึ้นหน้าเว็บ → มีคน report → admin ปิดประกาศ
- Verify user แล้ว ประกาศถัดไปของเขาขึ้น ACTIVE ทันที

**Commit:** `M7: admin moderation`

---

## Milestone 8 — บทความ + CMS

**เป้า:** เครื่องยนต์ SEO เริ่มทำงาน

**สั่งให้ทำ:**
- `/admin/articles`: เขียน/แก้บทความ Markdown (textarea + preview), อัปรูปปก, เลือกหมวด, publish/unpublish
- `/articles` + `/articles/[slug]`: render Markdown สวย อ่านง่ายบนมือถือ, ISR 1 ชม., JSON-LD Article, บทความเกี่ยวข้อง, CTA ลิงก์ไปหมวดประกาศที่เกี่ยว
- หมวดบทความ: ปุ๋ย / โรคพืช / ราคาตลาด / เทคนิค / ข่าวเกษตร

**งานของคุณ:** เตรียมบทความจริง 15-20 เรื่องจากสคริปต์ YouTube เดิม (แปลงเป็น Markdown — งานนี้ให้ Claude ช่วยแปลงจากสคริปต์ได้ แต่คุณต้องคัดเรื่อง)

**เกณฑ์ตรวจรับ:**
- เขียนบทความจาก admin → publish → เห็นหน้าเว็บ → Google Rich Results Test ผ่าน Article schema

**Commit:** `M8: articles + CMS`

---

## Milestone 9 — หน้าแรก + โปรไฟล์ผู้ขาย + Sitemap

**เป้า:** ประกอบทุกอย่างเป็นเว็บสมบูรณ์

**สั่งให้ทำ:**
- หน้าแรก: hero สั้น + ค้นหา, แถบหมวดหมู่ (icon), ประกาศเด่น (featured), ประกาศล่าสุด 12 รายการ, บทความล่าสุด 3 เรื่อง, แถบ "จากช่อง YouTube" (embed/ลิงก์คลิปล่าสุด)
- `/sellers/[id]`: โปรไฟล์ผู้ขาย — avatar, จังหวัด, badge, วันที่เข้าร่วม, ประกาศ ACTIVE ทั้งหมด
- `sitemap.xml` + `robots.txt` อัตโนมัติ (listings + articles)
- หน้า 404 / error / loading states ทุก route หลัก
- หน้า static: เกี่ยวกับเรา, นโยบายความเป็นส่วนตัว, ข้อตกลงการใช้งาน (ร่างเนื้อหา PDPA เบื้องต้นให้ด้วย)

**เกณฑ์ตรวจรับ:**
- คลิกไล่ทุกลิงก์จากหน้าแรกไม่เจอ dead link
- `/sitemap.xml` มีทุกประกาศ ACTIVE + ทุกบทความ published

**Commit:** `M9: homepage + profiles + seo infra`

---

## Milestone 10 — Polish + ทดสอบรวม

**เป้า:** พร้อมให้คนจริงใช้

**สั่งให้ทำ:**
- ไล่เช็ค responsive ทุกหน้า 360px–1440px
- Empty states ทุกจุด (ยังไม่มีประกาศ/บทความ/ผลค้นหา) — ข้อความชวนทำ action ต่อ
- Loading skeleton การ์ดประกาศ
- Error handling: อัปรูปล้ม, network ล้ม — แจ้งชัด + retry ได้
- Accessibility ขั้นต่ำ: focus ring, alt text, contrast ผ่าน
- ตรวจ N+1 query ทุกหน้า list (ใช้ include ให้ถูก)

**Checklist ทดสอบมือ (คุณทำบนมือถือจริง):**
- [ ] สมัครใหม่ด้วย LINE → ลงประกาศ → รออนุมัติ → admin อนุมัติ → เห็นบนเว็บ → กดโทรได้
- [ ] ค้นหา + filter ทุกหมวด
- [ ] แก้ประกาศ → ปิดการขาย → ต่ออายุ
- [ ] Report → admin จัดการ
- [ ] อ่านบทความ → กด CTA ไปหน้าประกาศ

**Commit:** `M10: polish + QA`

---

## Milestone 11 — Deploy Production

**เป้า:** เว็บออนไลน์จริง

**สั่งให้ทำ:**
- เตรียม production config: env validation, security headers, `next.config` production
- Script ตรวจ env ครบก่อน build

**งานของคุณ:**
- [ ] ซื้อโดเมน → ต่อ Vercel
- [ ] ใส่ env ทั้งหมดใน Vercel
- [ ] เปลี่ยน LINE callback URL เป็นโดเมนจริง
- [ ] Migrate + seed ข้อมูลจริงขั้นต่ำ (หมวด, บทความ 15 เรื่อง, ประกาศตั้งต้นของคุณเอง 10-20 รายการ — เว็บเปล่าดูร้าง)
- [ ] Google Search Console: submit sitemap
- [ ] ตั้ง Umami/Plausible analytics

**เกณฑ์ตรวจรับ:**
- Flow เต็มบนโดเมนจริงจากมือถือ 4G ผ่านหมด

**Commit + tag:** `v1.0.0`

---

## Milestone 12 — Launch กับฐาน YouTube 40k

(ไม่ใช่งานโค้ด — งานของคุณ)
- [ ] คลิป YouTube แนะนำเว็บ + วิธีลงประกาศ (ทำ 1 คลิปเต็ม + Shorts 2-3 ตัว)
- [ ] Pinned comment + description ทุกคลิปเก่ายอดวิวสูง ใส่ลิงก์เว็บ
- [ ] ชวนผู้ติดตามที่ขายของอยู่แล้ว 20-30 คนแรกมาลง (ติดต่อตรง) — เว็บต้องมีของก่อนเปิดกว้าง
- [ ] เฝ้าดู 2 สัปดาห์แรก: จุดไหนคนติด ลงประกาศไม่จบ → กลับไปแก้เป็น M13+

---

## Phase 1.5 — Directory ร้านค้าเกษตร (D1–D6)

> เริ่มได้เมื่อ M7 (admin) เสร็จเป็นอย่างเร็ว — **แนะนำหลัง M11 (launch MVP) แล้ว** เพื่อไม่ให้ MVP ล่าช้า
> สเปคเต็มอยู่ CLAUDE.md section 10 — ทุก milestone ใช้ stack/convention เดิม ห้ามเปลี่ยน architecture

**คำสั่งเริ่มงาน (ก้อปวางใน Claude Code):**
```
อ่าน CLAUDE.md (โดยเฉพาะ section 10), PLAN.md, STATUS.md แล้วสำรวจโครงสร้าง
โปรเจ็คปัจจุบันให้ครบก่อน จากนั้นสรุปแผนสั้นๆ ว่าจะ integrate ระบบ directory
เข้ากับโครงสร้างเดิมตรงไหนบ้าง แล้วรอผมยืนยันก่อนค่อยเริ่ม D1
ห้ามเปลี่ยน architecture เดิม ห้ามแตะโค้ด listings/articles ที่ทำงานอยู่แล้ว
```

### D1 — Schema + Seed CSV
**สั่งให้ทำ:**
- เพิ่ม model `Shop`, `ShopImage`, enum `ShopStatus` ตาม CLAUDE.md section 10 + migrate
- `config/shopCategories.ts`: 6 หมวดร้าน + mapping หมวดร้าน↔หมวดประกาศ
- Seed script อ่าน CSV (`scripts/seed-shops.ts`): parse, validate, สร้าง slug, upsert — รันซ้ำได้ไม่ duplicate
- ข้อมูลตัวอย่าง 10 ร้าน 1 จังหวัด (ใช้จังหวัดที่คุณมีข้อมูลร้านจริง)

**งานของคุณ:** เตรียม CSV ร้านจริงชุดแรก (เริ่มจากจังหวัดของคุณ/จังหวัดที่ฐานคนดู YouTube เยอะสุด)

**เกณฑ์ตรวจรับ:** รัน seed 2 รอบไม่เกิด duplicate, Prisma studio เห็นครบ, build ผ่าน
**Commit:** `D1: shop schema + csv seed`

### D2 — หน้า Directory ทั้งหมด
**สั่งให้ทำ:**
- Routes ทั้ง 4 ระดับ: `/ร้านค้า`, `/[จังหวัด]`, `/[จังหวัด]/[หมวด]`, `/[จังหวัด]/[หมวด]/[slug]` — ใช้ design system เดิม, การ์ดร้านหน้าตาเดียวกับการ์ดประกาศ
- หน้ารวม: ค้นหาชื่อร้าน + filter จังหวัด/หมวด
- หน้าโปรไฟล์ร้าน: รูป, ที่อยู่, แผนที่ (ลิงก์ Google Maps จาก lat/lng — ยังไม่ embed), เวลาเปิด, **ปุ่มโทร + LINE sticky** (reuse component จากหน้าประกาศ)
- แสดงเฉพาะ `status: APPROVED` เสมอ
- หน้าจังหวัด/หมวดที่ไม่มีร้าน → 404

**เกณฑ์ตรวจรับ:** ไล่คลิกครบทุกระดับ route บนมือถือ, ปุ่มโทรเปิด dialer จริง, build ผ่าน
**Commit:** `D2: directory pages`

### D3 — Cross-link สองทาง
**สั่งให้ทำ:**
- หน้าประกาศ: บล็อก "ร้านค้า/ตัวแทนจำหน่ายใกล้คุณ" — Shop APPROVED หมวด mapping ตรง + จังหวัดเดียวกัน สูงสุด 4 ร้าน (ไม่มีร้าน → ซ่อนบล็อก)
- หน้าร้าน: บล็อก "ประกาศขายในพื้นที่นี้" (หมวด mapping + จังหวัดเดียวกัน) + บทความหมวดเกี่ยวข้อง 3 เรื่อง
- หน้าหมวด directory: ลิงก์ไปหมวดประกาศ + บทความที่เกี่ยว
- ทุก query ผ่าน mapping ใน `config/shopCategories.ts` เท่านั้น ห้าม hardcode

**เกณฑ์ตรวจรับ:** เปิดประกาศหมวดปุ๋ยในจังหวัดที่มีร้าน → เห็นร้านแนะนำถูกหมวดถูกจังหวัด และกลับกัน
**Commit:** `D3: cross-link shops-listings-articles`

### D4 — SEO ครบชุด
**สั่งให้ทำ:**
- JSON-LD: `LocalBusiness` ทุกหน้าร้าน, `BreadcrumbList` ทุกหน้า directory
- metadata + OG รายหน้า ตาม title pattern ใน CLAUDE.md section 10
- ย่อหน้าคอนเทนต์ ≥ 150 คำ บนหน้าจังหวัด/หมวด — generator จากข้อมูลจริง + template ≥ 3 แบบสลับ
- sitemap.xml เพิ่มทุกหน้า directory (เฉพาะหน้าที่มีร้าน)
- ISR ตามตารางใน section 10 + on-demand revalidate เมื่อ approve/แก้ร้าน

**เกณฑ์ตรวจรับ:** Google Rich Results Test ผ่าน LocalBusiness + Breadcrumb, sitemap ไม่มีหน้าเปล่า
**Commit:** `D4: directory seo`

### D5 — ฟอร์มลงทะเบียนร้าน + Approve flow
**สั่งให้ทำ:**
- `/ลงทะเบียนร้านค้า`: ฟอร์มไม่บังคับล็อกอิน, อัปรูปสูงสุด 4 รูป (reuse ImageUploader), zod validate, honeypot + rate limit → PENDING
- `/admin/shops`: คิว PENDING (approve/reject), แก้ข้อมูลร้าน, ตั้ง featured — ใช้แพทเทิร์นเดียวกับ `/admin/moderation` เดิม
- หน้า "ส่งข้อมูลสำเร็จ รอตรวจสอบ 1-2 วัน"

**เกณฑ์ตรวจรับ:** flow ครบ: submit จากมือถือ → PENDING → admin approve → ขึ้นหน้า directory + เข้า sitemap
**Commit:** `D5: shop registration + approve`

### D6 — อัปเดตเอกสารโปรเจ็ค
**สั่งให้ทำ:**
- อัปเดต CLAUDE.md: ย้ายสิ่งที่ตัดสินใจจริงระหว่างทำ (ถ้าต่างจากสเปค) เข้า section 10, เพิ่มคำสั่ง seed CSV ใน section commands
- อัปเดต STATUS.md: สรุประบบ directory ทั้งหมด — data model จริง, routes, วิธี seed, สิ่งที่เหลือ
- เช็คว่า session ใหม่อ่านแค่ CLAUDE.md + STATUS.md แล้วทำงานต่อได้ทันที

**เกณฑ์ตรวจรับ:** เปิด session ใหม่ สั่งงานเล็กๆ 1 อย่าง (เช่น เพิ่มหมวดร้าน) โดยไม่อธิบายอะไรเพิ่ม → ทำถูก
**Commit:** `D6: docs update` + tag `v1.1.0`

**งานของคุณหลัง D6 (data = หัวใจของ directory):**
- [ ] เติม CSV ร้านจริงต่อเนื่อง จังหวัดละ batch — เริ่มจากจังหวัดฐานคนดูเยอะ
- [ ] คลิป/Shorts แนะนำ "ค้นหาร้านปุ๋ย-ร้านเกษตรใกล้บ้าน" ชี้มาที่ directory
- [ ] ติดต่อร้านที่ลงไว้ให้มา claim/อัปเดตข้อมูลเอง → นำไปสู่ featured แบบเสียเงิน (รายได้ Phase 3)

---

## กติกากันหลุดราง (สำคัญ)

1. **Build ต้องผ่านก่อน commit ทุกครั้ง** — ไม่มีข้อยกเว้น
2. ถ้า Opus แก้เกิน scope milestone → สั่ง revert แล้วเริ่ม milestone ใหม่จาก checkpoint เดิม
3. ทุก session ใหม่เริ่มด้วย "อ่าน CLAUDE.md, PLAN.md, STATUS.md ก่อน"
4. อย่าให้ Opus "ปรับปรุง" สิ่งที่ทำเสร็จแล้วใน milestone เก่าโดยไม่ได้สั่ง
5. ติดปัญหาเกิน 2-3 รอบแก้ไม่หลุด → commit สภาพปัจจุบัน, เปิด session ใหม่, อธิบายปัญหาสั้นๆ ให้เริ่มมองใหม่
