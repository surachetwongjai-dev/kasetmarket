# KasetMarket — แพลตฟอร์มชุมชน + ประกาศขายสินค้าเกษตร

> CLAUDE.md — Project memory สำหรับ Claude Code
> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง อัปเดต STATUS.md หลังจบทุก milestone

---

## 1. Project Overview

**What:** เว็บแพลตฟอร์มให้เกษตรกร/พ่อค้าแม่ค้าโพสประกาศขายสินค้าเกษตร (แนว classifieds — ผู้ซื้อติดต่อผู้ขายตรงทางโทร/LINE) พร้อมคลังบทความความรู้เกษตรเพื่อดึง SEO และสร้างชุมชน

**Who:**
- Owner/Admin: เจ้าของช่อง YouTube เกษตร (ผู้ติดตาม 40k) ใช้ช่องเป็น traffic source หลัก
- Seller: เกษตรกร/ผู้ขายที่มาลงประกาศ (ใช้มือถือเป็นหลัก, ถนัด LINE)
- Buyer: ผู้ซื้อทั่วไป ค้นหา → ดูประกาศ → ติดต่อผู้ขายตรง

**Business model (ลำดับ):** ฟรีก่อนเพื่อสร้างฐาน → บูสต์ประกาศ/ประกาศเด่น → ค่าสมาชิกร้านค้า → affiliate สินค้าเกษตร

**สิ่งที่ MVP ไม่ทำ (ตัดสินใจแล้ว ห้ามหลุด scope):**
- ❌ ระบบตะกร้า/จ่ายเงินบนเว็บ (Phase 3)
- ❌ ระบบแชทในเว็บ (ใช้ LINE/โทรแทน)
- ❌ แอปมือถือ (เว็บ responsive ก่อน)
- ❌ ฟอรัมชุมชน (Phase 2 เมื่อมี traffic สม่ำเสมอ)

---

## 2. Tech Stack

| Layer | Choice | เหตุผล |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | ISR สำหรับบทความ/ประกาศ, SEO, Server Components |
| Database | PostgreSQL + Prisma | คุ้นเคยอยู่แล้ว, migration ง่าย |
| Styling | Tailwind CSS + shadcn/ui | ยก components จาก ShopDash ได้ |
| Auth | Auth.js (NextAuth v5) + LINE Login (หลัก) + Email/รหัสผ่าน + Google Login | เกษตรกรไทยใช้ LINE ทุกคน แต่ต้องมีทางเลือกสำหรับคนที่ไม่มี LINE (ตัดสินใจหลัง M2 — เดิมมีแผน "เบอร์โทร OTP" เป็นสำรอง แต่เลื่อนไป Phase 2 เพราะมีต้นทุนค่า SMS ต่อครั้ง จึงใช้ Email/รหัสผ่าน + Google แทนเพราะไม่มีต้นทุนต่อการใช้งาน) |
| Image storage | Cloudflare R2 + next/image | ไม่มีค่า egress, ถูก |
| Search (MVP) | Postgres full-text + trigram (pg_trgm) | พอสำหรับหมื่นประกาศแรก |
| Search (later) | Meilisearch | เมื่อประกาศ > 50k หรือต้องการ typo-tolerance ภาษาไทย |
| Deploy | Vercel (เริ่มต้น) → VPS ถ้าค่าใช้จ่ายสูง | เร็วสุดตอนเริ่ม |
| Analytics | Umami (self-host) หรือ Plausible | ถูก, PDPA-friendly |

**Rendering strategy (สำคัญต่อความเร็ว):**
- บทความ: **ISR** revalidate 1 ชม. — โหลดเร็ว, SEO เต็ม
- หน้าประกาศรายตัว: **ISR** revalidate 5 นาที + on-demand revalidate เมื่อผู้ขายแก้ไข
- หน้า list/ค้นหา: **Server Component + streaming** (dynamic เพราะมี filter)
- Dashboard (admin/seller): **dynamic, no cache**

---

## 3. Design System

### โทน: เขียว โมเดิร์น คลีน — "ท้องนายามเช้า"

Grounded ในโลกจริงของนาข้าว ไม่ใช่เขียว startup ทั่วไป

```
--color-primary:     #1E7A46;  /* เขียวใบข้าว — ปุ่มหลัก, ลิงก์ */
--color-primary-dk:  #14522F;  /* เขียวเข้ม — hover, header text */
--color-surface:     #F7F8F4;  /* ขาวนวลอมเขียว — พื้นหลังหลัก */
--color-card:        #FFFFFF;  /* การ์ดประกาศ */
--color-accent:      #E8A317;  /* ทองข้าวเปลือก — ป้าย "ประกาศเด่น", ราคา */
--color-text:        #22301F;  /* เขียวชาโคล — ตัวหนังสือหลัก */
--color-muted:       #6B7A64;  /* ตัวหนังสือรอง, ป้ายกำกับ */
--color-danger:      #C0392B;  /* ลบ, รายงานประกาศ */
```

### Typography (ต้องรองรับไทยดี)
- **Display / หัวข้อ:** `Anuphan` (weight 600-700) — โมเดิร์น สะอาด อ่านไทยชัด
- **Body:** `IBM Plex Sans Thai Looped` (weight 400-500) — อ่านสบายบนมือถือ
- **ตัวเลข/ราคา:** `IBM Plex Sans` tabular-nums — ราคาต้องเด่นและตรงคอลัมน์

### Signature element
**"ป้ายราคาต่อหน่วย"** — ทุกการ์ดประกาศแสดงราคาใหญ่ + หน่วยเกษตรจริง (บาท/กก., บาท/ตัน, บาท/ถุง, บาท/ต้น) ในกรอบสีทองข้าวเปลือก นี่คือสิ่งที่ผู้ซื้อสินค้าเกษตรมองหาก่อนทุกอย่าง และแพลตฟอร์มทั่วไปไม่มี

### UI rules
- Mobile-first เสมอ (ผู้ใช้หลักคือเกษตรกรบนมือถือ)
- ปุ่ม "โทร" และ "LINE" ต้องใหญ่ กดง่าย อยู่ล่างจอ (sticky) บนหน้าประกาศ
- การ์ดประกาศ: รูป 4:3 → ชื่อ → ป้ายราคา/หน่วย → จังหวัด + เวลาโพส
- ไม่ใช้ animation เกินจำเป็น (ผู้ใช้บางส่วนใช้เน็ต/เครื่องช้า)
- Touch target ≥ 44px, ฟอนต์ body ≥ 16px

---

## 4. Folder Structure

```
src/
├── app/
│   ├── (public)/              # หน้าสาธารณะ — ISR/static
│   │   ├── page.tsx           # หน้าแรก
│   │   ├── listings/          # /listings, /listings/[slug]
│   │   ├── articles/          # /articles, /articles/[slug]
│   │   └── sellers/[id]/      # หน้าโปรไฟล์ผู้ขาย
│   ├── (auth)/                # login, register
│   ├── dashboard/             # ผู้ขาย: จัดการประกาศตัวเอง
│   ├── admin/                 # แอดมิน (role-gated)
│   └── api/                   # route handlers (upload, revalidate, webhook)
├── features/                  # ⭐ แยกตามฟีเจอร์ ไม่แยกตาม type
│   ├── listings/              # components + actions + queries ของประกาศ
│   ├── articles/
│   ├── auth/
│   ├── moderation/
│   └── search/
├── components/ui/             # shadcn + ชิ้นส่วนที่ยกมาจาก ShopDash
├── lib/                       # prisma client, r2 client, utils
└── config/
    ├── categories.ts          # หมวดหมู่สินค้าเกษตร (แก้ที่เดียว)
    ├── units.ts               # หน่วยขาย (กก./ตัน/ถุง/ต้น/ไร่)
    └── provinces.ts           # 77 จังหวัด + ภูมิภาค
```

**หลักการเพื่อความยืดหยุ่น:**
1. ทุกฟีเจอร์อยู่ใน `features/<name>/` ครบวงจร (UI + server actions + queries) — เพิ่ม/ถอดฟีเจอร์ = เพิ่ม/ลบโฟลเดอร์เดียว
2. ค่าคงที่ทางธุรกิจ (หมวด, หน่วย, จังหวัด) อยู่ใน `config/` เท่านั้น ห้าม hardcode ในหน้า
3. Server Actions สำหรับ mutations, ไม่สร้าง API route ถ้าไม่จำเป็น
4. Feature flags ใน `config/flags.ts` — เปิด/ปิดฟีเจอร์ที่ยังไม่พร้อมโดยไม่ต้องลบโค้ด

---

## 5. Data Model (Prisma)

```prisma
model User {
  id          String    @id @default(cuid())
  role        Role      @default(SELLER)   // ADMIN | SELLER
  name        String
  phone       String?   @unique
  lineUserId  String?   @unique
  avatarUrl   String?
  province    String?
  verified    Boolean   @default(false)    // แอดมินยืนยันตัวตนแล้ว
  createdAt   DateTime  @default(now())
  listings    Listing[]
  reports     Report[]
}

model Listing {
  id          String        @id @default(cuid())
  slug        String        @unique          // SEO: /listings/ขายข้าวหอมมะลิ-สุรินทร์-x7f2
  title       String
  description String        @db.Text
  price       Decimal
  unit        String                         // จาก config/units.ts
  negotiable  Boolean       @default(true)   // ต่อรองได้
  category    String                         // จาก config/categories.ts
  province    String
  district    String?
  images      ListingImage[]
  contactPhone String?
  contactLine  String?                       // LINE ID หรือลิงก์
  status      ListingStatus @default(PENDING) // PENDING|ACTIVE|SOLD|EXPIRED|REJECTED
  featured    Boolean       @default(false)  // ประกาศเด่น (monetization)
  views       Int           @default(0)
  expiresAt   DateTime                       // default +30 วัน, ต่ออายุได้
  seller      User          @relation(...)
  sellerId    String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([category, province, status])
  @@index([status, createdAt])
}

model ListingImage {
  id        String  @id @default(cuid())
  url       String
  order     Int     @default(0)
  listing   Listing @relation(...)
  listingId String
}

model Article {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String
  content     String   @db.Text   // Markdown
  coverUrl    String?
  category    String              // ปุ๋ย/โรคพืช/ราคาตลาด/เทคนิค
  published   Boolean  @default(false)
  publishedAt DateTime?
  views       Int      @default(0)
}

model Report {
  id         String   @id @default(cuid())
  listingId  String
  reporterId String?
  reason     String              // หลอกลวง/สินค้าผิดกม./สแปม/อื่นๆ
  detail     String?
  resolved   Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

**หมวดหมู่เริ่มต้น (`config/categories.ts`):**
ข้าว/ข้าวเปลือก · ผัก · ผลไม้ · พืชไร่ (มัน/อ้อย/ข้าวโพด) · ต้นกล้า-เมล็ดพันธุ์ · ปุ๋ย-ฮอร์โมน · สัตว์เลี้ยงเกษตร (วัว/หมู/ไก่/ปลา) · เครื่องจักร-อุปกรณ์ · ที่ดิน-สวน-นา · อื่นๆ

---

## 6. Features

### Phase 1 — MVP (เป้า 3-4 สัปดาห์)

**Public/Buyer:**
- [ ] หน้าแรก: ประกาศล่าสุด + ประกาศเด่น + หมวดหมู่ + บทความล่าสุด
- [ ] หน้ารวมประกาศ + filter: หมวด, จังหวัด, ช่วงราคา, เรียงตาม (ใหม่สุด/ถูกสุด)
- [ ] หน้าประกาศรายตัว: gallery รูป, ป้ายราคา/หน่วย, ปุ่มโทร + LINE (sticky bottom), ปุ่มรายงาน, ประกาศใกล้เคียง
- [ ] ค้นหาข้อความ (Postgres FTS)
- [ ] หน้าบทความ + บทความรายตัว (Markdown, ISR, SEO meta ครบ)
- [ ] หน้าโปรไฟล์ผู้ขาย: ประกาศทั้งหมดของคนนี้ + badge ยืนยันตัวตน

**Seller:**
- [ ] สมัคร/ล็อกอินด้วย LINE (หลัก) + เบอร์โทร OTP (สำรอง)
- [ ] ลงประกาศ: อัปรูปสูงสุด 6 รูป (client-side resize ก่อนอัป), เลือกหมวด/หน่วย/จังหวัด
- [ ] จัดการประกาศตัวเอง: แก้ไข / ปิดการขาย (SOLD) / ต่ออายุ / ลบ
- [ ] Dashboard ง่ายๆ: ยอดวิวแต่ละประกาศ

**Admin (คุณ):**
- [ ] คิวอนุมัติประกาศ (moderation queue): approve / reject พร้อมเหตุผล
- [ ] จัดการ user: ban, verify (ติ๊ก badge ยืนยัน)
- [ ] จัดการรายงาน (reports)
- [ ] CMS บทความ: เขียน/แก้ Markdown + อัปรูปปก + publish
- [ ] ตั้ง featured listing (ประกาศเด่น)
- [ ] Dashboard: ประกาศใหม่วันนี้, users ใหม่, ประกาศรออนุมัติ

### Phase 1.5 — Directory ร้านค้า/ตัวแทนจำหน่ายเกษตร
ระบบ Local Directory ดัก local SEO — สเปคเต็มอยู่ section 10 (แนะนำเริ่มหลัง M11/launch MVP แล้ว)

### Phase 2 — Growth
- [ ] Favorites/บันทึกประกาศ
- [ ] แจ้งเตือนผ่าน LINE Notify เมื่อมีประกาศใหม่ในหมวด/จังหวัดที่ติดตาม
- [ ] ราคาตลาดกลางรายวัน (ดึงจากกรมการค้าภายใน) — จุดดึง traffic ประจำวัน
- [ ] ฟอรัมถามตอบ (เปิดเมื่อมีคนดูแลตอบสม่ำเสมอ)
- [ ] Meilisearch ถ้าประกาศโตเกิน Postgres FTS

### Phase 3 — Monetization
- [ ] บูสต์ประกาศ (จ่ายผ่าน PromptPay QR + แอดมินยืนยัน slip ก่อน แล้วค่อย automate)
- [ ] แพ็กร้านค้ารายเดือน (ลงได้ไม่จำกัด + badge ร้านค้า)
- [ ] Affiliate ปุ๋ย/อุปกรณ์ในหน้าบทความ

---

## 7. Reuse จาก ShopDash

**ยกมาได้เลย (copy ไฟล์):**
- `components/ui/*` — button, card, input, dialog, badge
- Image upload flow + client-side resize
- Tailwind config พื้นฐาน (เปลี่ยนเฉพาะ color tokens ตาม section 3)
- Utility: formatPrice, formatThaiDate, slug generator

**ห้ามยกมา (เขียนใหม่):**
- Data model / Prisma schema (คนละโดเมน)
- Auth (ShopDash ไม่มี multi-user role)
- ทุกอย่างที่ผูกกับ "ร้านเดียว"

---

## 8. Workflow & Conventions

### Milestone-based development (ตาม workflow เดิม)
- ทำงานเป็น milestone ละ 1 ฟีเจอร์จบ → `git commit` checkpoint ทุกครั้ง
- อัปเดต `STATUS.md` หลังจบ milestone: ทำอะไรไป, ติดอะไร, next step
- ห้ามเริ่ม milestone ใหม่ถ้าตัวเก่ายังไม่ผ่าน build + ทดสอบมือถือ

### Coding conventions
- Server Components เป็น default; `"use client"` เฉพาะที่จำเป็น (form, interactive)
- Mutations ใช้ Server Actions + zod validate ทุก input
- ข้อความ UI ทั้งหมดเป็นภาษาไทย เก็บใน component ตรงๆ ได้ (ยังไม่ทำ i18n)
- รูปทุกรูปผ่าน next/image + R2, ห้าม hotlink
- ทุก query ที่ list ประกาศต้อง filter `status: ACTIVE` เสมอ ยกเว้นใน admin/dashboard

### Commands
```bash
npm run dev          # dev server
npm run build        # ต้องผ่านก่อน commit milestone
npx prisma migrate dev --name <ชื่อ>
npx prisma studio    # ดูข้อมูล
npx tsx scripts/seed-shops.ts <ไฟล์.csv>   # seed ร้านค้า directory จาก CSV (รันซ้ำได้ ไม่ duplicate)
```

**⚠️ env files:** `.env` = dev · `.env.production-db` = DB production (ใช้กับสคริปต์ผ่าน `dotenv-cli` เท่านั้น)
**ห้าม**ตั้งชื่อ `.env.production.local` — Next โหลดชื่อนั้นอัตโนมัติตอน `next build`/`next start` ทำให้เทสในเครื่องแอบชี้ prod DB (เจอมาแล้ว 2026-07-12)
เทส production build ในเครื่อง: override `DATABASE_URL`/`DIRECT_URL` เป็นของ dev + ตั้ง `AUTH_TRUST_HOST=true` (Auth.js ปฏิเสธ host ที่ไม่รู้จักใน production mode — บน Vercel ตั้งให้อัตโนมัติ)

### Security & PDPA
- เบอร์โทรผู้ขายแสดงเฉพาะเมื่อผู้ซื้อกด "แสดงเบอร์" (ลด scraping)
- Rate limit การลงประกาศ: 5 ประกาศ/วัน/user (กัน spam)
- ประกาศใหม่จาก user ที่ยังไม่ verified → เข้าคิว PENDING เสมอ
- user ที่ verified แล้ว → ACTIVE ทันที (ลดภาระแอดมิน)
- มีหน้า นโยบายความเป็นส่วนตัว + ข้อตกลงการใช้งาน ก่อนเปิดจริง

---

## 9. SEO Strategy (traffic engine)

- ทุกประกาศ = 1 หน้า indexable: title pattern `"ขาย{สินค้า} {จังหวัด} ราคา{ราคา} บาท/{หน่วย}"`
- JSON-LD: `Product` + `Offer` บนหน้าประกาศ, `Article` บนบทความ
- บทความชุดแรก 15-20 เรื่อง แปลงจากสคริปต์ YouTube เดิม (ปุ๋ยตามระยะข้าว, ฮอร์โมนไข่, ตารางฉีดพ่น ฯลฯ)
- ทุกคลิป YouTube ใหม่ → ใส่ลิงก์บทความ/หมวดประกาศที่เกี่ยวใน description
- sitemap.xml อัตโนมัติ (Next.js sitemap) แยก listings / articles / directory

---

## 10. ระบบ Directory ร้านค้า/ตัวแทนจำหน่ายเกษตร (Phase 1.5)

> ใช้ stack, โครงสร้างโฟลเดอร์, convention เดิมทั้งหมด — ห้ามเปลี่ยน architecture
> โค้ดอยู่ใน `features/directory/` ครบวงจรตามหลัก section 4

### เป้าหมายเชิงธุรกิจ: 3 ชั้นทำงานร่วมกัน
1. **ชั้นทราฟฟิก** = หน้า directory รายจังหวัด/อำเภอ/หมวดร้าน (ดัก local SEO เช่น "ร้านขายปุ๋ย นครสวรรค์")
2. **ชั้นคอนเทนต์** = บทความเกษตร (มีแล้ว)
3. **ชั้นรายได้** = ประกาศขาย (มีแล้ว) → หน้า affiliate (Phase 3)

**Cross-link (ปรับจากสเปคเดิมให้ตรงสภาพจริง):**
- ตอนนี้ยังไม่มี Product/affiliate model → cross-link ร้าน ↔ ประกาศ ใช้ **การ match หมวด + จังหวัด** (query, ไม่ใช้ join table):
  - หน้าประกาศ แสดงบล็อก "ร้านค้า/ตัวแทนจำหน่ายใกล้คุณ" = Shop ที่หมวดเกี่ยวข้อง + จังหวัดเดียวกัน (สูงสุด 4 ร้าน)
  - หน้าร้าน แสดง "ประกาศขายในหมวด/จังหวัดนี้" + ลิงก์บทความหมวดเกี่ยวข้อง
- เมื่อทำ affiliate Phase 3 → ค่อยเพิ่ม `ShopProduct` many-to-many ตามสเปคเดิม

### Data Model (เพิ่มใน Prisma)

```prisma
model Shop {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String     @db.Text
  categories  String[]                      // จาก config/shopCategories.ts (หลายหมวดได้)
  province    String
  district    String?
  address     String?
  lat         Float?
  lng         Float?
  phone       String?
  lineId      String?
  facebookUrl String?
  openHours   String?                       // เก็บ text ง่ายๆ ก่อน เช่น "จ-ส 8:00-17:00"
  images      ShopImage[]
  featured    Boolean    @default(false)
  status      ShopStatus @default(PENDING)  // PENDING | APPROVED | REJECTED
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([province, status])
  @@index([status])
}

model ShopImage {
  id     String @id @default(cuid())
  url    String
  order  Int    @default(0)
  shop   Shop   @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId String
}
```

**หมวดร้าน (`config/shopCategories.ts`):**
ปุ๋ย-เคมีเกษตร · เมล็ดพันธุ์ · เครื่องจักรกลเกษตร · อะไหล่-ซ่อมบำรุง · ร้านวัสดุเกษตรทั่วไป · รับซื้อผลผลิต

**Mapping หมวดร้าน ↔ หมวดประกาศ** (สำหรับ cross-link) เก็บใน `config/shopCategories.ts` ที่เดียว เช่น `ปุ๋ย-เคมีเกษตร ↔ [ปุ๋ย-ฮอร์โมน]`, `เครื่องจักรกลเกษตร ↔ [เครื่องจักร-อุปกรณ์]`, `รับซื้อผลผลิต ↔ [ข้าว/ข้าวเปลือก, ผัก, ผลไม้, พืชไร่]`

### Routes (slug ภาษาไทยตาม convention เดิม)

| Route | หน้าที่ | Rendering |
|---|---|---|
| `/ร้านค้า` | รวม + ค้นหา + filter จังหวัด/หมวด | Server Component dynamic |
| `/ร้านค้า/[จังหวัด]` | รายจังหวัด | ISR 1 ชม. |
| `/ร้านค้า/[จังหวัด]/[หมวด]` | **หน้าดัก keyword หลัก** | ISR 1 ชม. |
| `/ร้านค้า/[จังหวัด]/[หมวด]/[slug]` | โปรไฟล์ร้าน | ISR + on-demand revalidate |
| `/ลงทะเบียนร้านค้า` | ฟอร์ม submit ร้านใหม่ → PENDING | dynamic |

### SEO Requirements (ห้ามข้าม)
- schema.org: `LocalBusiness` ทุกหน้าร้าน (รวม lat/lng, openHours, telephone), `BreadcrumbList` ทุกหน้า directory, เชื่อม `Product` schema เมื่อมี Phase 3
- sitemap.xml รวมทุกหน้า directory อัตโนมัติ (จังหวัด × หมวด × ร้าน)
- metadata + OG image รายหน้า — title pattern หน้าหมวด: `"ร้าน{หมวด} {จังหวัด} — รวมร้านค้า ตัวแทนจำหน่าย พร้อมเบอร์โทร"`
- **หน้าจังหวัด/หมวดต้องมีย่อหน้าคอนเทนต์จริง ≥ 150 คำ** ไม่ใช่ list เปล่า (กัน thin content) — เขียน generator ที่ประกอบจากข้อมูลจริง (จำนวนร้าน, อำเภอที่มีร้าน, หมวดเด่น) + template หลายแบบสลับกัน
- **ห้าม generate หน้าจังหวัด/หมวดที่ไม่มีร้านเลย** — ให้ 404 หรือไม่ใส่ใน sitemap (thin/empty pages ทำ SEO พังทั้งเว็บ)
- ปุ่มโทร tap-to-call + ปุ่ม LINE ทุกหน้าร้าน, sticky บนมือถือ (ใช้ component เดียวกับหน้าประกาศ)

### Admin / Data
- Seed script รับ CSV: `name, categories, province, district, address, phone, lineId, facebookUrl, openHours` → upsert เป็น batch (สำหรับเติมข้อมูลร้านจริงจำนวนมาก)
- Approve flow: ใช้ admin panel เดิม (M7) — เพิ่มแท็บ `/admin/shops`: คิว PENDING, approve/reject, แก้ข้อมูลร้าน, ตั้ง featured
- ฟอร์ม `/ลงทะเบียนร้านค้า` ไม่บังคับล็อกอิน (ลด friction เจ้าของร้านสูงวัย) แต่มี rate limit + honeypot กัน spam

### การตัดสินใจจริงระหว่างสร้าง (D1–D6, 2026-07-12) — ต่างจาก/เพิ่มจากสเปคข้างบน

1. **URL ไทยทำผ่าน rewrite ไม่ใช่ชื่อโฟลเดอร์ route:** Next 15.5 มีบั๊ก match static segment ที่เป็น unicode ไม่ได้ (request percent-encoded จาก browser/Googlebot จริงคืน 404 — พิสูจน์แล้วกับ `next start`) จึงเก็บ route จริงเป็น ascii `app/(public)/shops/...` + `app/(public)/register-shop/` แล้ว rewrite `/ร้านค้า/*` → `/shops/*`, `/ลงทะเบียนร้านค้า` → `/register-shop` ใน `next.config.ts` (ต้องมี source ทั้งรูป encoded และ literal) พร้อม redirect ทางกลับกัน path ภายใน → URL ไทย กัน duplicate content — **URL สาธารณะเป็นไทยตามสเปคทุกหน้า** ตัวช่วยประกอบ path อยู่ `features/directory/paths.ts` ห้ามประกอบเอง
2. **`config/shopCategories.ts`:** DB เก็บ `value` ascii (convention เดียวกับหมวดประกาศ), มี `slug` ไทยสำหรับ URL segment + `listingCategories` mapping ตามสเปค — helper: `shopCategoryBySlug`, `listingCategoriesOfShop`, `shopCategoriesForListingCategory`
3. **Shop มี `@@unique([name, province])`** เป็น natural key ให้ seed CSV รันซ้ำได้ไม่ duplicate (slug คงเดิม URL ไม่เปลี่ยน) — ร้านที่ seed สร้างใหม่เป็น APPROVED ทันที (ข้อมูลจากแอดมิน) แต่รันซ้ำจะไม่แตะ status เดิม (ร้านที่ reject ไปแล้วไม่ฟื้น)
4. **`redirect()` ใน server action ที่ชี้ URL ไทยต้อง `encodeURI()`** — ไม่งั้น Location header มีอักขระ non-ASCII → 500 (เจอจริงตอนเทส no-JS form)
5. **`revalidatePath` ของหน้า directory ใช้ path ภายใน `/shops/...`** (route จริง) ไม่ใช่ URL ไทย — actions D5 revalidate ครบทั้งหน้า hub/จังหวัด/หมวด/ร้าน + sitemap เมื่อ approve/แก้/ตั้ง featured
6. **อัปรูปฟอร์มลงทะเบียน (ไม่ล็อกอิน) ใช้ `/api/upload/shop`** แยกจาก `/api/upload` (ที่ยังบังคับล็อกอิน) — จำกัด 12 ครั้ง/ชม./IP แบบ in-memory; ฟอร์ม submit เองก็มี honeypot (ช่อง `website`) + rate limit 3 ครั้ง/ชม./IP + global cap 20 ร้าน/ชม. จาก DB
7. **`ImageUploader` เพิ่ม props `max` + `endpoint`** (backward-compatible) และ `ListingGallery` widen type รูปเป็น `{id,url}[]` เพื่อ reuse กับร้านค้า
