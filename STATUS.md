# STATUS.md — KasetMarket

> อัปเดตหลังจบทุก milestone — session ใหม่อ่านไฟล์นี้คู่กับ CLAUDE.md + PLAN.md

- **Milestone ปัจจุบัน:** Phase 2 — **กลุ่ม T (Trust) เสร็จครบ** + **กลุ่ม P (ราคากลาง P1+P2) เสร็จครบ ✅** + **กลุ่ม U (โปรไฟล์เกษตรกร U1+U2) เสร็จครบ ✅** · ก้อนถัดไปตามแผน = **กลุ่ม B (กระดานจับคู่ซื้อขาย)** หรือ **กลุ่ม C (ชุมชน)** / **กลุ่ม S (ค่าขนส่ง)** — สลับได้อิสระ (หรือ P3 import อัตโนมัติ ทำหลังมีโดเมนจริง)
- **⚙️ Feature flag:** `FLAGS.REVIEWS = false` (T2 เปิดเมื่อพร้อม) · T3 verify ไม่มี flag · `FLAGS.PRICES = false` (หน้า public P2 สร้างเสร็จ+เทสผ่าน — เปิด `true` เมื่อกรอกราคา ~2 วันแล้ว จะได้มีลูกศรเปลี่ยนแปลง · admin CMS P1 เปิดใช้ได้เลยไม่ผูก flag) · `FLAGS.FARM_PROFILE = false` (**U1+U2 เสร็จ+เทสผ่านครบ** — เปิด `true` ได้เลยตอน deploy **หลังรัน migration `add_farm_profile` บน prod** ไม่งั้นหน้า `/sellers/[id]` จะ error)
- **⚠️ migration ค้างสำหรับ prod (6 ตัว):** `add_shop_directory` · `add_contact_reveal` · `add_seller_reviews` · `add_verification_request` · `add_price_tables` · `add_farm_profile` — ตอน deploy: `npx dotenv-cli -e .env.production-db -- npx prisma migrate deploy` แล้วรัน `npx dotenv-cli -e .env.production-db -- npx tsx scripts/seed-price-items.ts` (seed 26 รายการราคา)
- **โดเมนจริง:** taladkaset.com (ผู้ใช้แจ้ง 2026-07-12) — ตั้ง `NEXT_PUBLIC_SITE_URL=https://taladkaset.com` ตอน deploy; แบรนด์ในโค้ดยังเป็น "KasetMarket" ถ้าจะรีแบรนด์ต้องสั่งเป็นงานแยก
- **อัปเดตล่าสุด:** 2026-07-13

---

## Phase 2 — U2: Public farmer profile ✅ (2026-07-13)

> สเปค PLAN-PHASE2.md §4 กลุ่ม U (U2) — ปรับหน้า `/sellers/[id]` โฉมใหม่ · section ฟาร์มคุมด้วย `FLAGS.FARM_PROFILE`

### สิ่งที่ทำ

- **`features/profile/components/farm-profile-section.tsx`:** บล็อกข้อมูลฟาร์มบนหน้า public — หัวข้อ "เกี่ยวกับ {ชื่อ}" + **chips ประเภทกิจการ** (icon+label จาก `config/farmTypes`) + สินค้าหลัก + ขนาดพื้นที่ (ไร่) + bio (whitespace-pre-line) + **gallery รูปฟาร์ม** (reuse `ListingGallery` — รับ `{id,url}[]`) · helper **`hasFarmContent()`** (type guard) = แสดง section เฉพาะเมื่อมีข้อมูลจริง (bio/products/sizeRai/farmTypes/รูป อย่างน้อย 1)
- **`/sellers/[id]`:** เพิ่ม `getFarmProfile(id)` ใน `Promise.all` เฉพาะเมื่อ `FLAGS.FARM_PROFILE` → render `FarmProfileSection` คั่นระหว่าง header กับรายการประกาศ · เปลี่ยนหัวข้อ "ประกาศที่กำลังขาย" → **"กำลังขายตอนนี้"** (ตามสเปค) · ส่วน rating (T2) + reviews คงเดิม
- **ไม่พังของเก่า:** ผู้ใช้ไม่มี FarmProfile หรือ flag ปิด → หน้าเป็นแบบเดิมเป๊ะ (header + ประกาศ + reviews)
- **report โปรไฟล์ (เลื่อน):** สเปคระบุปุ่มรายงานโปรไฟล์ แต่ `Report` ผูก `listingId` (required) — ต้องแก้ schema moderation ก่อน · **ไม่อยู่ในเกณฑ์ตรวจรับ U2** + ซ้ำซ้อนกับ report ประกาศ + ban user (M7) สำหรับ MVP → เลื่อนไปทำเป็นงาน moderation แยก

### ทดสอบแล้ว (E2E บน `next start` prod build flag=ON + dev DB — เทสเสร็จปิด flag กลับ)

- [x] **seller มี FarmProfile:** หน้า 200 + "เกี่ยวกับ {ชื่อ}" + chips (นาข้าว/โรงงาน-ผู้รับซื้อ) + สินค้าหลัก + **42 ไร่** + bio + รูปฟาร์ม (gallery) + "กำลังขายตอนนี้" + ประกาศ ACTIVE
- [x] **seller ไม่มี FarmProfile:** หน้า 200 + **ไม่มีบล็อกฟาร์ม** (หน้าเดิม) + ชื่อ/ประกาศครบ ไม่พัง
- [x] ประเภทกิจการ/สินค้า/ขนาด/bio/รูป render ถูกทุก field (ยืนยันจาก HTML จริง — `<!-- -->` คือ text-separator ของ React ไม่ใช่ bug)
- [x] `npm run build` ผ่านทั้ง flag on/off — ข้อมูล+สคริปต์ทดสอบล้างหมด (FarmProfile 0 แถว)

### งานที่เหลือ

- [ ] เปิด `FLAGS.FARM_PROFILE=true` ตอน deploy (หลังรัน migration `add_farm_profile` บน prod)
- [ ] (ทางเลือก) report โปรไฟล์ + section admin — ต้องขยาย schema moderation ก่อน

---

## Phase 2 — U1: Farm profile schema + edit form ✅ (2026-07-13)

> สเปค PLAN-PHASE2.md §4 กลุ่ม U (U1) — schema + ฟอร์มแก้โปรไฟล์ · หลัง `FLAGS.FARM_PROFILE` (ปิดไว้ เปิดเมื่อ U2 หน้า public เสร็จ)

### สิ่งที่ทำ

- **Schema:** `FarmProfile` (`userId @unique` = 1 โปรไฟล์/user, bio `@db.Text`, `farmTypes String[]`, products, sizeRai Int?, province/district, updatedAt) + `FarmProfileImage` (แพทเทิร์น ListingImage, ≤4 รูป) + back-relation `User.farmProfile` · migration `20260713000000_add_farm_profile` (gen ด้วย `migrate diff` — **apply dev DB แล้ว, prod ยังไม่**)
- **`config/farmTypes.ts`:** 8 ประเภท (นาข้าว/สวนผลไม้/ไร่พืชไร่/ฟาร์มปศุสัตว์/บ่อปลา-กุ้ง/ร้านค้าเกษตร/โรงงาน-ผู้รับซื้อ/อื่นๆ) value ascii + label + icon (helper `getFarmTypeLabel`)
- **`features/profile/`:** schemas (zod profile + `profileFormDataToObject` — จัดการ `farmTypes` getAll, `sizeRai` ว่าง→undefined), actions (**saveFarmProfileAction** — transaction: `User.update`(name/province) + `FarmProfile.upsert`(create/update+แทนรูปทั้งชุด) + rate limit in-memory 10 ครั้ง/วัน/user), queries (getFarmProfile), components (**profile-form** reuse `ImageUploader max={4}`)
- **`/dashboard/profile`** (dynamic, หลัง flag → notFound เมื่อปิด): ฟอร์มเดียวแก้ ชื่อที่แสดง (User.name) + จังหวัด/อำเภอ + ประเภทกิจการ (checkbox หลายค่า) + สินค้าหลัก + ขนาดไร่ + แนะนำตัว + รูป ≤4 · บันทึกแล้วโชว์ success + revalidate `/sellers/[id]` ทันที · การ์ด "โปรไฟล์เกษตรกร" ในแดชบอร์ด (เมื่อ flag เปิด)
- **การตัดสินใจ:** `province` เขียนลงทั้ง `User.province` (ใช้ทั้งเว็บ เช่น prefill ประกาศ) และ `FarmProfile.province` (ที่ตั้งฟาร์ม) — mirror จาก picker เดียว ไม่ให้มี 2 ช่องจังหวัดบนมือถือ · **name บังคับ** (User.name เป็น NOT NULL) ที่เหลือไม่บังคับ

### ทดสอบแล้ว (integration + E2E บน `next start` prod build flag=ON + dev DB — เทสเสร็จปิด flag กลับ)

- [x] **Integration 26/26** (validation จริง + DB write จริง): create branch ครบ field + 2 รูปเรียงถูก · update branch เคลียร์ค่า (province→null, sizeRai→null, farmTypes→[]) + แทนรูปเหลือ 1 (ไม่ค้าง) + upsert แถวเดิม · `sizeRai` ว่าง→undefined ไม่ใช่ 0 · name ว่าง/province ปลอม/farmType ปลอม → parse ล้มเหลว · cascade ลบ user → FarmProfile+รูปหายด้วย
- [x] **HTTP:** flag off → `/dashboard/profile` 404 (build static) · flag on ไม่ล็อกอิน → 307 ไป `/login` · ล็อกอิน admin → ฟอร์ม 200 ครบทุก field
- [x] **no-JS server-action submit จริง** → 200, `User.name/province` + `FarmProfile` (farmTypes 2/products/sizeRai 42/bio/district) ลง DB ถูก · **`/sellers/[id]` revalidate 200** ทันที
- [x] `npm run build` ผ่านทั้ง flag on/off — ข้อมูลทดสอบ+สคริปต์ล้างหมด

### งานที่เหลือ

- [ ] **U2 ถัดไป:** ปรับ `/sellers/[id]` โฉมใหม่ — chips ประเภทกิจการ + bio + gallery รูปฟาร์ม + "กำลังขายตอนนี้" + รีวิว (T2) + ปุ่มรายงานโปรไฟล์ · ผู้ใช้ไม่มี FarmProfile = หน้าเดิม (ไม่พังของเก่า) · `FLAGS.FARM_PROFILE` คุมเฉพาะ section ใหม่
- [ ] ตอน deploy prod: migration `add_farm_profile` (ต่อจากที่ค้าง) — `npx dotenv-cli -e .env.production-db -- npx prisma migrate deploy`

---

## Phase 2 — P2: Public price pages ✅ (2026-07-12)

> สเปค PLAN-PHASE2.md §3 กลุ่ม P (P2) — หน้า public + SEO · หลัง `FLAGS.PRICES` (ปิดไว้ เปิดเมื่อมีข้อมูล ~2 วัน)

### สิ่งที่ทำ

- **URL ไทย** `/ราคาสินค้าเกษตร` → route จริง `/prices` (rewrite ใน next.config ตามแพทเทิร์น directory) + `/ราคาสินค้าเกษตร/[slug]` → `/prices/[slug]` + redirect ascii→ไทย (308) · path helper `features/prices/paths.ts`
- **`features/prices` เพิ่ม:** `format.ts` (priceMid/priceChange/formatRange/isStale — ไม่พึ่ง prisma), public queries (getPriceOverview 2 entry ล่าสุด/รายการ, getPriceItemDetail 30 วัน, getPriceItemsForSitemap, getHomeFeaturedPrices, getListingsForPriceCategory cross-link), components (**price-sparkline** SVG polyline เขียนเอง, **price-change** ▲เขียว/▼แดง/—)
- **หน้ารวม `/ราคาสินค้าเกษตร`** (ISR 1 ชม.): จัดกลุ่มตามหมวด — ตาราง ชื่อ/ราคาล่าสุด(min–max)+หน่วย/ลูกศรเปลี่ยน/วันที่ · header วันอัปเดตล่าสุด + เตือนถ้าเก่า >7 วัน + disclaimer "ราคาอ้างอิง" · ตาราง overflow-x-auto (มือถือไม่ล้น)
- **หน้ารายตัว `/ราคาสินค้าเกษตร/[slug]`** (ISR 1 ชม.): ราคาล่าสุดป้ายทองตัวใหญ่ + ลูกศร, sparkline SVG, ตาราง 30 วันย้อนหลัง (เปลี่ยนต่อแถว), แหล่งอ้างอิง+ลิงก์, **cross-link** ประกาศหมวด map + บทความ (reuse mapping), JSON-LD `Dataset`, SEO title "ราคา{ชื่อ}วันนี้ ล่าสุด {เดือน ปี} — ย้อนหลัง 30 วัน" · รายการไม่มี entry → 404
- **cross-link mapping** ใน `config/priceCategories.ts` (หมวดราคา → หมวดประกาศ) · **sitemap** เพิ่มหน้ารวม+รายตัวเฉพาะที่มีข้อมูล (หลัง flag) · **หน้าแรก** แถบ "ราคาวันนี้" 5 รายการเด่น + **nav header** ลิงก์ "ราคากลาง" (ทั้งคู่เมื่อ flag เปิด) · **saveDailyPricesAction** (P1) revalidate `/prices` + รายตัวที่บันทึก + `/` + sitemap

### ทดสอบแล้ว (E2E บน `next start` prod build flag=ON + seed 2 วัน — 19/19 ผ่าน · เทสเสร็จปิด flag)

- [x] กรอก 2 วันติด → **หน้ารวมโชว์ลูกศรถูกทิศ** (ขึ้น▲/ลง▼/เท่าเดิม—) + disclaimer
- [x] หน้ารายตัว: ราคาใหญ่ 12,500 บาท/ตัน + ▲ + **sparkline SVG** + ตารางย้อนหลัง + **JSON-LD Dataset** + **cross-link ประกาศ**
- [x] **รายการไม่มีข้อมูล → 404 + ไม่โชว์ในหน้ารวม + ไม่เข้า sitemap**
- [x] sitemap มีหน้ารวม+รายตัวที่มีข้อมูล · redirect `/prices` → URL ไทย (308) · หน้าแรกมีแถบ "ราคาวันนี้"
- [x] `npm run build` ผ่านทั้ง flag on/off — ข้อมูล/สคริปต์ทดสอบล้างหมด (คง 26 catalog, 0 entry)

### งานที่เหลือ

- [ ] (ฝั่งคุณ) กรอกราคาจริงที่ `/admin/prices` อย่างน้อย 2 วัน → เปิด `FLAGS.PRICES=true` → หน้า public + แถบหน้าแรก + nav โผล่พร้อมลูกศรเปลี่ยนแปลง
- [ ] **P3 (หลังมีโดเมนจริง):** probe MOC/NABC API + import อัตโนมัติ + cron (สเปคใน PLAN-PHASE2 §3)

---

## Phase 2 — P1: Price schema + admin daily entry ✅ (2026-07-12)

> สเปค PLAN-PHASE2.md §3 กลุ่ม P (P1) — admin CMS กรอกราคา (หน้า public = P2) · admin-only ไม่ผูก flag

### สิ่งที่ทำ

- **Schema:** `PriceItem` (slug ไทย, category, unit, sourceName/Url, mocProductId เผื่อ P3, active, order) + `PriceEntry` (`@@unique([itemId, date])`, priceMin/priceMax Decimal, date `@db.Date`) · migration `20260712040000_add_price_tables` (gen ด้วย `migrate diff` ให้ตรง Prisma เป๊ะ — **apply dev DB แล้ว, prod ยังไม่**)
- **`config/priceCategories.ts`:** 6 หมวด (ข้าว-พืชไร่/ผัก/ผลไม้/ปศุสัตว์/ประมง/อื่นๆ) value ascii + label + icon
- **`scripts/seed-price-items.ts`:** upsert 26 รายการเริ่มต้นตาม slug (รันซ้ำได้ ไม่แตะราคาเดิม) — ข้าวเปลือก 3 ชนิด/มัน/ข้าวโพด/อ้อย/ยาง/ปาล์ม/ทุเรียน/มังคุด/ลำไย/สุกร/ไก่/**ไข่ไก่คละ**/โค/ปลานิล/ปลาดุก/กุ้งขาว ฯลฯ พร้อม unit + sourceName · **รันกับ dev DB แล้ว (26 รายการ)**
- **`features/prices/`:** schemas (zod item + date), queries (getItemsForDailyEntry prefill ค่าล่าสุด ≤ วันที่, getAllPriceItems, bangkokTodayStr), actions (**saveDailyPricesAction** bulk upsert ตาม date + create/update/toggle-active item), components (price-entry-form, price-item-form)
- **`/admin/prices`:** หน้ากรอกรายวันตารางเดียวจบ — เลือกวันที่ (prefill ค่าล่าสุดของเมื่อวาน + ป้าย "ค่าเมื่อ <วันที่>"), min/max ต่อแถวจัดกลุ่มตามหมวด, ปุ่มบันทึกทีเดียว (sticky), ช่องว่าง = ไม่บันทึก · **`/admin/prices/items`:** เพิ่ม/แก้/เปิด-ปิด active · แท็บ "ราคากลาง" ใน admin
- Server Action + zod, admin only (ราคา > 0, max ≥ min, กรอง itemId ปลอม)

### ทดสอบแล้ว (E2E บน `next start` prod build + dev DB — 10/10 ผ่าน)

- [x] admin กรอกราคา 5 รายการ+บันทึก → **ลง DB 5 แถว วันที่ถูก** + ค่าตรงที่กรอก (min/max)
- [x] **กรอกซ้ำวันเดิม = ทับค่าเดิม ไม่ duplicate** (ยัง 5 แถว, ค่าอัปเดต)
- [x] **prefill วันถัดไปโชว์ค่าเมื่อวาน** + ป้าย "ค่าเมื่อ 2020-01-02"
- [x] validation `max < min` → ไม่บันทึก · `npm run build` ผ่าน — ข้อมูลทดสอบล้าง (คง 26 รายการ catalog, 0 entry)

### งานที่เหลือ

- [ ] (ฝั่งคุณ) เริ่มกรอกราคาจริงรายวัน ~10 นาที/วัน ที่ `/admin/prices` (ดู CLAUDE.md — ตลาดไท/สี่มุมเมือง อ้างอิงได้ ห้าม scrape)
- [ ] **P2 ถัดไป:** หน้า public `/ราคาสินค้าเกษตร` + `[slug]` (ISR, ลูกศรเปลี่ยนแปลง, sparkline, JSON-LD Dataset) หลัง `FLAGS.PRICES`

---

## Phase 2 — T3: Verification request flow ✅ (2026-07-12)

> สเปค PLAN-PHASE2.md §2 กลุ่ม T (T3) — **ไม่มี flag เปิดใช้ทันที** · ปิดกลุ่ม Trust ครบ

### สิ่งที่ทำ

- **Schema:** `VerificationRequest` (`userId @unique` = 1 คำขอ/user, `note` ของผู้ขอ, `method` วิธีตรวจของแอดมิน, `rejectReason`, `status` PENDING/APPROVED/REJECTED, `reviewedAt`) + back-relation `User.verificationRequest` · migration `20260712030000_add_verification_request` (**apply dev DB แล้ว — prod ยังไม่**)
- **`features/trust/`:** schemas (verificationRequest/approve/reject zod), queries (getMyVerificationRequest, getVerificationsForAdmin, getOpenVerificationCount), actions (submit upsert→PENDING / approve บังคับ method→`User.verified=true` ใน transaction / reject บังคับ reason), components (verify-card, verify-admin-actions)
- **Dashboard ผู้ขาย:** การ์ด "ยืนยันตัวตน" — อธิบายประโยชน์ (badge ✓ + ประกาศขึ้นทันที) → ฟอร์ม note → PENDING แสดง "ทีมงานจะติดต่อทาง LINE OA ภายใน 2 วัน เตรียมรูปสวน/ฟาร์ม/หน้าร้าน" → REJECTED แสดงเหตุผล + ส่งใหม่ได้ → verified แสดงสถานะยืนยันแล้ว · **ห้ามมีช่องอัปโหลดไฟล์/เอกสาร** (PDPA) มีข้อความบอกชัด
- **แอดมิน:** แท็บ "ยืนยันตัวตน" + `/admin/verifications` (คิว PENDING เห็นโปรไฟล์+จำนวนประกาศ+รีวิวของผู้ขอ, อนุมัติบังคับกรอก method / ปฏิเสธบังคับเหตุผล — ใช้ `<details>` ให้ฟอร์มอยู่ใน HTML ทำงานได้แม้ไม่มี JS) + การ์ด "คำขอยืนยันตัวตน" ในภาพรวม
- **`/safety`:** เพิ่ม section "ป้าย ✓ หมายความว่าอะไร" — โปร่งใสว่า verified = ทีมงานตรวจตัวตนเบื้องต้นแล้ว **แต่ไม่ใช่การการันตี** ต้องระวังทุกราย
- อนุมัติแล้ว `User.verified=true` → กลไก badge + ข้ามคิวประกาศ (M5/M7) ทำงานเอง + revalidate โปรไฟล์/ประกาศ badge ขึ้นทันที

### ทดสอบแล้ว (E2E เต็ม flow บน `next start` prod build + dev DB — 19/19 ผ่าน)

- [x] seller ส่งคำขอ → DB PENDING+note → dashboard โชว์ "รอทีมงานตรวจสอบ" + LINE OA + note (ไม่มีฟอร์มซ้ำ)
- [x] **ไม่มีช่องอัปโหลดไฟล์ (`type=file`) ทั้งใน dashboard และ /admin/verifications** + มีข้อความบอกห้ามอัปเอกสาร
- [x] แอดมินอนุมัติ**ไม่กรอก method → ไม่ผ่าน** (DB ไม่เปลี่ยน) · กรอก method → APPROVED + method saved + `User.verified=true`
- [x] seller dashboard = "ยืนยันตัวตนแล้ว" · โปรไฟล์ public โชว์ badge ✓ ทันที (ประกาศตัวถัดไป ACTIVE ตามกลไก M5 verified)
- [x] ปฏิเสธพร้อมเหตุผล → REJECTED + user ยังไม่ verified → ผู้ขอเห็นเหตุผล + **ส่งใหม่ได้** → กลับเป็น PENDING เคลียร์เหตุผลเดิม
- [x] admin overview การ์ด "คำขอยืนยันตัวตน" · `npm run build` ผ่าน — ข้อมูล/สคริปต์ทดสอบล้างหมด

---

## Phase 2 — T2: Seller reviews ✅ (2026-07-12)

> สเปค PLAN-PHASE2.md §2 กลุ่ม T (T2) — อยู่หลัง `FLAGS.REVIEWS` (ปิดไว้ ยังไม่โชว์ต่อผู้ใช้จริง)

### สิ่งที่ทำ

- **Schema:** `SellerReview` (unique `[sellerId, reviewerId]` = 1 รีวิว/คู่, `sellerReply`, `hidden`) + `ReviewReport` + back-relation `User.reviewsReceived/reviewsGiven` + `Listing.reviews` · migration `20260712020000_add_seller_reviews` (**apply dev DB แล้ว — prod ยังไม่**)
- **`features/trust/`** (ต่อจาก T1): `schemas.ts` (zod review/reply/report + REVIEW_REPORT_REASONS), `queries.ts` (ratingSummary aggregate, reviews (ไม่ hidden), **getReviewEligibility** — กติกากันรีวิวปลอม, admin reports), `actions.ts` (submit upsert / delete / reply / report / admin hide+resolve), components (rating-stars, review-form, reply-form, report-button, review-list, review-section, admin-actions)
- **กติกากันรีวิวปลอม (re-validate ฝั่ง server ทุก mutation):** ต้องล็อกอิน · ห้ามรีวิวตัวเอง · ต้องมี `ContactReveal` ของตัวเองบนประกาศของผู้ขายรายนั้น **อายุ ≥24 ชม.** (หรือมีรีวิวเดิม = แก้ได้) · 1 รีวิว/คู่ (upsert) · rate limit เขียน/แก้รวม 5/วัน · listingId ที่แนบต้องเป็นประกาศของผู้ขายจริง (กันแนบมั่ว)
- **แสดงผล:** หน้าโปรไฟล์ `/sellers/[id]` (เปลี่ยนเป็น **dynamic** เพราะต้องรู้ผู้ชม) — ดาวเฉลี่ย (ทศนิยม 1) + จำนวน + ฟอร์ม/ข้อความเงื่อนไข + list รีวิว + ตอบกลับ(ผู้ขาย) · กล่องผู้ขายในหน้าประกาศ (ISR) โชว์ดาว+จำนวน · caption ใต้ทุกรีวิว "รีวิวจากผู้ที่กดดูช่องทางติดต่อผ่านแพลตฟอร์ม" (ไม่เคลม 'ผู้ซื้อจริง')
- **แอดมิน:** แท็บ "รีวิว" + `/admin/reviews` (คิวรายงาน + ซ่อน/เลิกซ่อน + resolve) + การ์ด "รายงานรีวิวค้าง" ในภาพรวม — ทั้งหมดโผล่เฉพาะเมื่อ flag เปิด
- **Gate `FLAGS.REVIEWS`:** ปิด = ซ่อน UI ทุกจุด (โปรไฟล์/หน้าประกาศ/แท็บ+การ์ดแอดมิน) + `/admin/reviews` → 404 · ข้อมูลเดิมคงอยู่

### ทดสอบแล้ว (E2E บน `next start` prod build flag=ON + dev DB — เทสเสร็จปิด flag กลับ)

- [x] **กติกาสิทธิ์ (getReviewEligibility) ทุกกิ่ง:** ไม่ล็อกอิน→not-logged-in · รีวิวตัวเอง→self · ไม่เคยกดเบอร์→need-reveal · กด <24ชม.→reveal-too-recent · กด ≥24ชม.→รีวิวได้ (+suggestedListingId)
- [x] eligible เห็นฟอร์ม · ไม่ครบเงื่อนไขเห็นข้อความบอกเหตุผล ไม่เห็นฟอร์ม
- [x] ส่งรีวิวผ่าน server action จริง → ลง DB · โปรไฟล์+หน้าประกาศโชว์ดาวเฉลี่ย/จำนวนถูก + caption + ความเห็น
- [x] รีวิวซ้ำ = แก้รีวิวเดิม (ยัง 1 แถว, ดาวคำนวณใหม่) · ผู้ขายตอบกลับโชว์ได้
- [x] รายงานรีวิว → แอดมินเห็นในคิว → กดซ่อน → **หายจากหน้าเว็บ + ดาวเฉลี่ยคำนวณใหม่**
- [x] `npm run build` ผ่านทั้ง flag on/off — ข้อมูล+สคริปต์ทดสอบล้างหมด

### งานที่เหลือ

- [ ] ตอน deploy prod: migration `add_seller_reviews` (ต่อจาก `add_contact_reveal` + `add_shop_directory` ที่ค้าง) — `npx dotenv-cli -e .env.production-db -- npx prisma migrate deploy`
- [ ] เปิด `FLAGS.REVIEWS=true` เมื่อพร้อม (แนะนำเปิดได้เลย ไม่มีภาระ moderation ล่วงหน้า — รีวิว gate อยู่แล้ว + มีปุ่มรายงาน)

---

## Phase 2 — T1: Safety notices + Contact reveal log ✅ (2026-07-12)

> สเปค PLAN-PHASE2.md §2 กลุ่ม T (T0+T1 ทำรวมใน session เดียว) — กติการ่วม §1 ใช้ครบ

### สิ่งที่ทำ

- **`config/flags.ts`**: เพิ่ม 6 flags Phase 2 (ปิดหมด) — `REVIEWS`, `PRICES`, `FARM_PROFILE`, `MATCHING`, `COMMUNITY`, `SHIPPING_RATES` (แทน placeholder เดิม `MARKET_PRICES`/`FORUM` ที่ไม่ถูกอ้างถึง — ตั้งชื่อตรงกับที่ milestone หลังๆ อ้าง). คำเตือนตัวกลาง **ไม่มี flag** (เปิดใช้ทันทีตามสเปค)
- **`features/trust/components/safety-notice.tsx`**: คอมโพเนนต์เดียว 2 variant (ไม่มี hook → ใช้ได้ทั้ง server/client) — `banner` การ์ดเหลืองทอง + ลิงก์ "วิธีซื้อขายปลอดภัย", `pre-reveal` ข้อความสั้นบังคับเห็นก่อนเบอร์โผล่
- **`ContactReveal`** model + migration `20260712010000_add_contact_reveal` (**apply dev DB แล้ว — prod ยังไม่**), back-relation ที่ `User.contactReveals` + `Listing.contactReveals` · `POST /api/listings/[id]/reveal?channel=phone|line` — เก็บ `userId` ถ้าล็อกอิน (จาก `auth()`), rate limit IP in-memory 60/ชม., FK error (id ประกาศไม่มี) = เงียบ ไม่ throw
- **`ContactButtons`** เพิ่ม prop `revealEndpoint?` (backward-compatible): กด "แสดงเบอร์โทร" → เห็นคำเตือน `pre-reveal` + ปุ่ม "เข้าใจแล้ว ดูเบอร์" → เบอร์โผล่ (2 จังหวะ), ยิง reveal beacon ตอนยืนยันดูเบอร์ + ตอนกด LINE (dedupe ต่อ session ด้วย sessionStorage แพทเทิร์นเดียวกับ ViewTracker) — หน้าประกาศส่ง endpoint (log), หน้าร้าน directory ไม่ส่ง (แค่เตือน ไม่มี Listing ให้ผูก)
- **หน้า `/safety`** ("วิธีซื้อขายปลอดภัย"): banner + 10 ข้อควรทำ + สัญญาณเตือนมิจฉาชีพ + ช่องทางแจ้งความ (ไซเบอร์ 1441/thaipoliceonline, สคบ. 1166, อายัดบัญชี) — indexable, ลิงก์จาก footer
- วาง banner: หน้าประกาศรายตัว (**แทนข้อความเตือน `⚠️` เดิม**) + หน้าร้าน directory (เหนือปุ่มติดต่อ)

### ทดสอบแล้ว (E2E บน `next start` prod build + dev DB)

- [x] หน้าประกาศ 200 + มี banner "taladkaset เป็นตัวกลาง..." + ปุ่ม "แสดงเบอร์โทร" + **เบอร์จริงไม่อยู่ใน HTML ก่อนกด** (กัน scraping) + reveal endpoint ผูกถูก listing id
- [x] footer มีลิงก์ `href="/safety"` · `/safety` 200 + มีคู่มือ + ช่องทางแจ้งความ 1441
- [x] **reveal log ลง DB ทั้ง 2 เคส**: ไม่ล็อกอิน → `channel=phone, userId=null` · ล็อกอิน admin → `channel=line, userId=<admin>`
- [x] `channel` ผิด → 400 · หน้าร้าน/hub 200
- [x] `npm run build` ผ่าน (`/safety` เป็น static ○) — ข้อมูลทดสอบล้างแล้ว

### งานที่เหลือ

- [ ] ตอน deploy prod: `npx dotenv-cli -e .env.production-db -- npx prisma migrate deploy` (มี migration `add_contact_reveal` ค้างสำหรับ prod — เพิ่มจาก `add_shop_directory` ที่ยังค้างอยู่)
- [ ] (ฝั่งคุณ) ตั้ง LINE OA รับหลักฐาน verify ก่อนทำ T3 · เกณฑ์ว่าอะไรถึงผ่าน verify

---

## Phase 1.5: Directory ร้านค้า (D1–D6) ✅ (2026-07-12)

> สเปคเต็ม CLAUDE.md §10 + หัวข้อ "การตัดสินใจจริงระหว่างสร้าง" (สำคัญ: URL ไทยผ่าน rewrite เพราะบั๊ก unicode ของ Next 15.5)

### สิ่งที่ทำ (commit ละ milestone)

- **D1** (`5d63be0`): `Shop`/`ShopImage`/`ShopStatus` (migration `20260712000000_add_shop_directory` — apply กับ **dev DB แล้ว, prod ยังไม่**), `config/shopCategories.ts` (6 หมวด + mapping หมวดประกาศ + slug ไทย), `scripts/seed-shops.ts` (CSV → upsert ด้วย natural key `(name, province)` — เทสรัน 2 รอบไม่ duplicate), `prisma/shops-sample.csv` ข้อมูลตัวอย่าง 11 ร้าน (นครสวรรค์ 10 + ลพบุรี 1 — **ตัวอย่างทั้งหมด ต้องแทนด้วย CSV ร้านจริงก่อนใช้บน prod**)
- **D2** (`83a744a`): routes 4 ระดับใน `app/(public)/shops/` + rewrite เป็น URL ไทย `/ร้านค้า/[จังหวัด]/[หมวด]/[slug]`, `features/directory/` (queries/paths/shop-card/shop-filters/shop-pagination), จังหวัด-หมวดไม่มีร้าน → 404, nav header เพิ่มลิงก์ "ร้านค้าเกษตร" — เทสด้วย `next start` + curl: ทุก route คืน status ถูกต้องทั้ง URL encoded/raw, `/shops` redirect 308 กลับ URL ไทย
- **D3** (`c63e1c7`): cross-link ผ่าน mapping ใน config เท่านั้น — หน้าประกาศ↔บล็อก "ร้านค้าใกล้คุณ" (≤4), หน้าร้าน↔"ประกาศขายในพื้นที่นี้" (≤4) + บทความเกี่ยวข้อง (≤3), หน้าหมวด↔ลิงก์หมวดประกาศ+บทความ — เทสสองทางด้วยประกาศปุ๋ย ลพบุรี ↔ ร้านปุ๋ยลพบุรี
- **D4** (`5c7abe0`): `features/directory/seo.ts` — `LocalBusiness` (geo/openHours/telephone แบบมีเงื่อนไข) + `BreadcrumbList` JSON-LD ทุกหน้า, content generator ≥150 คำจากข้อมูลจริง (จำนวนร้าน/อำเภอ/หมวด/ร้านแนะนำ + คำแนะนำประจำหมวด, intro 3 แบบเลือกด้วย hash คงที่ต่อหน้า — วัดจริง: 183-204 คำ), sitemap เพิ่ม 21 URL directory (เฉพาะหน้าที่มีร้าน)
- **D5** (`731afee`): ฟอร์ม `/ลงทะเบียนร้านค้า` ไม่บังคับล็อกอิน (honeypot + rate limit 3/ชม./IP + global cap 20/ชม.) → PENDING, `/api/upload/shop` สำหรับอัปรูปไม่ล็อกอิน (12/ชม./IP), `/admin/shops` (คิว + approve/reject + featured + แก้ไข), on-demand revalidate ครบ — **เทส E2E เต็ม flow ผ่าน**: submit (จำลอง no-JS POST) → 303 ไปหน้าสำเร็จ → login admin → เห็นในคิว → approve → ขึ้นหน้าจังหวัด + เข้า sitemap (ข้อมูลทดสอบล้างแล้ว)
- **แก้ระหว่างทาง:** rename `.env.production.local` → `.env.production-db` (Next โหลดชื่อเดิมอัตโนมัติตอน build/start ทำให้เทสในเครื่องแอบชี้ prod DB — สคริต์ที่อ้างถึงแก้ครบแล้ว), `redirect()` URL ไทยต้อง `encodeURI()` (Location header เป็น ASCII เท่านั้น)

### งานที่เหลือ (ฝั่งคุณ)

- [ ] เตรียม **CSV ร้านจริง** ชุดแรก (จังหวัดฐานคนดู YouTube เยอะสุด) → ลบร้านตัวอย่าง + `npx tsx scripts/seed-shops.ts <ไฟล์>`
- [ ] ตอน deploy: `npx dotenv-cli -e .env.production-db -- npx prisma migrate deploy` (มี migration `add_shop_directory` ค้างสำหรับ prod)
- [ ] เทสบนมือถือจริง: ฟอร์มลงทะเบียนร้าน + แผนที่ + ปุ่มโทร/LINE บนหน้าร้าน
- [ ] ยังไม่ tag `v1.1.0` (PLAN ระบุ tag ที่ D6) — เพราะ `v1.0.0` ยังไม่ tag (M11 Phase B ยังไม่เสร็จ) แนะนำ tag ตามลำดับหลัง launch จริง
- [ ] คลิป/Shorts แนะนำ directory + ติดต่อร้านให้ claim ข้อมูล (ดูท้าย PLAN.md D6)

---

## ความคืบหน้า Deploy หลัง M11 ⏳ (บันทึก 2026-07-12 จากหลักฐานในไฟล์)

> Session ระหว่าง 2026-07-10 ถึง 12 มีงาน deploy คืบหน้าแต่ยังไม่ได้บันทึก/commit — สรุปจากหลักฐานที่ตรวจสอบได้ในเครื่อง:

- ✅ **OAuth ผ่านแล้ว** (TESTING.md A1, 2026-07-10): LINE + Google login สำเร็จบน localhost:3000 — งานค้างตั้งแต่ M3 ปิดได้
- ✅ **Production DB ตั้งแล้ว** (`.env.production-db` มี `DATABASE_URL`/`DIRECT_URL` แยกจาก dev — เดิมชื่อ `.env.production.local` แต่เปลี่ยนชื่อ 2026-07-12 เพราะ Next โหลดไฟล์ชื่อนั้นอัตโนมัติตอน `next build`/`next start` ทำให้เทสในเครื่องแอบชี้ prod DB)
- ✅ **บทความจริง 18 เรื่อง** (แปลงจากวิดีโอ YouTube, มี `youtubeUrl`) อยู่ใน dev DB และมีสคริปต์ก็อปขึ้น prod แล้ว: `scripts/copy-articles-to-prod.ts` (skipDuplicates รันซ้ำได้), `scripts/publish-all-articles.ts` (เผยแพร่ DRAFT ทั้งหมด เรียง publishedAt ตามวันวิดีโอ)
- ✅ **สคริปต์ admin/ตรวจสอบ**: `promote-admin.ts` (เลื่อน user บน prod เป็น ADMIN+verified), `list-users.ts`, `check-dup-articles.ts`, `inspect-articles.ts`
- หมายเหตุ: schema จริงใช้ `Article.youtubeUrl` + `videoUploadedAt` (ไม่ใช่ `videoId` ตามที่โน้ต M11 เดิมเขียน)

### งานที่เหลือ (ตาม TESTING.md — ติ๊กต่อในไฟล์นั้น)

- [ ] Phase A ที่เหลือ: เช็ค OAuth ใน DB, R2 upload จริง, flow seller/admin/buyer, มือถือ 360px
- [ ] Phase B: ยืนยัน soft-404 บนโดเมนจริง, Lighthouse ≥85, Rich Results, sitemap/robots, security headers, flow 4G
- [ ] Search Console + analytics + ตรวจกฎหมาย /privacy /terms → tag `v1.0.0`
- ⚠️ เมื่อ deploy Directory (D1+): ต้องรัน `npx prisma migrate deploy` กับ prod DB ด้วย (มี migration ใหม่ `add_shop_directory`)

---

## M11: Deploy Production ⏳ (ส่วนโค้ดเสร็จ 2026-07-10 — รอ deploy จริง)

### สิ่งที่ทำ (ส่วนโค้ด)

- **Session-aware header** (`0d0a6d8`): แสดงเมนูบัญชีเมื่อล็อกอิน ผ่าน client component + SessionProvider — หน้า public ยังคง ISR (ไม่เรียก `auth()` ใน layout ตามที่ตั้งใจไว้ตั้งแต่ M3)
- **SEO quick-wins** (`b349e29`): canonical URL ทุกหน้า public, default OG image (`app/opengraph-image.tsx`), structured data เพิ่มเติมบนหน้าแรก
- **ฝังวิดีโอ YouTube ในบทความ + Video SEO** (`e6c4c93`): `Article.videoId` (migration `20260709000000_add_article_video`), `<YouTubeEmbed>` (facade — โหลด iframe เมื่อกด play), JSON-LD `VideoObject`, script backfill/insert-drafts/verify-drafts ใน `prisma/`
- **Env validation ก่อน build** (สเปค M11 ใน PLAN.md): `scripts/check-env.ts` รันอัตโนมัติผ่าน `prebuild` — dev บังคับแค่ `DATABASE_URL`+`AUTH_SECRET` (+ R2 ต้องครบ 5 หรือไม่ใส่เลย), บน Vercel/`CHECK_ENV_STRICT=1` บังคับครบชุด production (LINE/Google, R2, SITE_URL ต้องไม่ใช่ localhost); เพิ่ม `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_YOUTUBE_URL` ลง `.env.sample` แล้ว
- **Security headers** ใน `next.config.ts`: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS — ยังไม่ใส่ CSP เต็ม (เสี่ยงชน inline script ของ Next + YouTube embed ค่อยพิจารณาหลัง launch)
- **กัน picsum บน prod**: hostname ของ picsum (รูป seed) อนุญาตเฉพาะนอก Vercel

### งานที่เหลือ (ฝั่งคุณ — โค้ดพร้อมแล้ว)

- [ ] ซื้อโดเมน → ต่อ Vercel → ใส่ env ทั้งหมด (check-env จะ fail build ถ้าขาด)
- [ ] เปลี่ยน LINE/Google callback URL เป็นโดเมนจริง + **ทดสอบ OAuth จริงครั้งแรก** (ค้างตั้งแต่ M3)
- [ ] สมัคร R2 + ใส่ 5 ค่า (production บังคับ)
- [ ] Migrate + seed ข้อมูลจริง (บทความ 15-20 เรื่อง, ประกาศตั้งต้น 10-20 รายการ)
- [ ] บนโดเมนจริง: ยืนยัน soft-404 (ดูโน้ต M10), วัด Lighthouse mobile ≥85, flow เต็มจากมือถือ 4G
- [ ] ให้ผู้เชี่ยวชาญกฎหมายตรวจร่าง /privacy /terms ก่อนเปิดจริง
- [ ] Google Search Console submit sitemap + ตั้ง Umami/Plausible
- [ ] เสร็จหมด → tag `v1.0.0` → เริ่ม M12 (Launch กับฐาน YouTube)

---

## M10: Polish + ทดสอบรวม ✅ (2026-07-07)

### สิ่งที่ทำ (ส่วนโค้ด)

- **Retry อัปรูป** (สเปคระบุ "อัปรูปล้ม/network ล้ม — retry ได้"): `ImageUploader` เก็บ `File` ไว้ในแต่ละ item, เมื่ออัปล้มแสดง error + ปุ่ม **"ลองอีกครั้ง"** ยิงใหม่จากไฟล์เดิม (เทสต์จริง: override fetch ให้ล้ม → เห็น error+ปุ่ม → คืน fetch → กด retry → อัปสำเร็จ)
- **เปลี่ยน build เป็น non-turbopack** (`next build` ไม่มี `--turbopack`) — แก้ปัญหา `next start` พัง (`routesManifest.dataRoutes is not iterable`) ที่พบใน M9 ทำให้ `npm run build && npm start` รันได้จริง สำคัญต่อ self-host VPS (แผน M11); dev ยังใช้ `--turbopack` (เร็ว)
- ทบทวน **empty states** ครบทุก surface (listings/articles/dashboard/seller/home/admin ทุกแท็บ) — มีครบตั้งแต่ M5-M9, loading skeleton หน้า list มีจาก M9

### ทดสอบแล้ว

- [x] **Responsive 360px**: home / listings / listing detail — ไม่มี horizontal overflow (scrollW = 362 = viewport)
- [x] **A11y**: รูปทั้งหมดมี `alt` ครบ (0 missing จาก 13 รูป), focus-visible ring บน interactive elements (แสดงเฉพาะ keyboard nav — ถูกต้อง), touch target ≥44px (h-11/h-12), semantic HTML (nav/main/article/header)
- [x] **N+1**: query หน้า list ทุกหน้าใช้ `include: { images: { take: 1 }}` (join เดียว), หน้าแรก 3 query ขนาน, admin ใช้ select/include — ไม่มี N+1
- [x] retry อัปรูปทำงาน, `npm run build` (non-turbopack) ผ่าน

### 🔴 ผลสืบสวน soft-404 (แก้ไข/อัปเกรดจากโน้ต M9)

ขุดลึกด้วย production build จริง (`next build` + `next start`) — **ยืนยันว่าไม่ใช่ dev/turbopack artifact แต่เป็นบั๊ก soft-404 จริงบน prod**: `/listings/[slug]` และ `/articles/[slug]` ที่ไม่มีจริง render เนื้อหา not-found ถูกต้องแต่คืน **HTTP 200 แทน 404** (`/sellers/[id]` คืน 404 ถูก)

**ตัดตัวแปรครบด้วยการทดลอง (build+start จริงหลายรอบ):** ไม่ใช่ generateMetadata, ไม่ใช่ loading.tsx, ไม่ใช่ revalidate, ไม่ใช่ decodeURIComponent, ไม่ใช่ render tree, ไม่ใช่ co-located not-found, ไม่ใช่ build cache — **สร้าง route ทดสอบ `[slug]` ที่โค้ด+query เหมือนกันเป๊ะในกลุ่ม `(public)` เดียวกัน → คืน 404 ถูกต้อง** พิสูจน์ว่า**โค้ดแอปถูกต้อง** เป็น nondeterminism ระดับ route manifest ของ Next 15.5 ที่แก้ที่ระดับโค้ดแอปไม่ได้

**ผลกระทบจำกัด:** กระทบเฉพาะ URL ประกาศ/บทความที่ถูกลบ/หมดอายุ (ซึ่งไม่อยู่ใน sitemap อยู่แล้ว) — เนื้อหา not-found แสดงถูก ผู้ใช้ไม่สับสน แค่ Google อาจ deindex ช้าลงเล็กน้อย

**Mitigation ที่ต้องทำ M11:** (1) ตรวจ status 404 บน Vercel prod จริง (Vercel อาจ handle ต่างจาก `next start`) (2) ถ้ายังเป็น ให้ลอง upgrade Next patch version หรือปรับโครง route (เช่น ย้าย list page ไป `/listings/browse`) (3) ถ้ายอมรับได้ ก็ปล่อยเพราะผลกระทบต่ำ

### Next step (M11 — Deploy)

- Deploy Vercel, ตั้ง env จริง (`DATABASE_URL`, `AUTH_SECRET`, LINE/Google, R2, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_YOUTUBE_URL`), ตั้ง LINE/Google callback เป็น domain จริง, ยืนยัน soft-404 บน prod
- **Checklist ทดสอบมือของคุณ (มือถือจริง):** สมัคร LINE → ลงประกาศ → admin อนุมัติ → กดโทร/LINE, ค้นหา+filter, แก้/ปิด/ต่ออายุ, report→admin, อ่านบทความ→CTA
- งานเนื้อหา: บทความจริง 15-20 เรื่อง

---

## M9: หน้าแรก + โปรไฟล์ผู้ขาย + Sitemap ✅ (2026-07-07)

### สิ่งที่ทำ

- **หน้าแรก** (Server Component, revalidate 300): hero + ช่องค้นหาใหญ่, แถบหมวด 10 หมวดพร้อม emoji icon (เพิ่ม `icon` ใน `config/categories.ts`), ประกาศเด่น, ประกาศล่าสุด 12, บทความล่าสุด 3, **แถบ YouTube** (แสดงเมื่อตั้ง `NEXT_PUBLIC_YOUTUBE_URL` — ตอนนี้ซ่อนอยู่ ไม่มี dead link)
- **`/sellers/[id]`** (ISR 300s): avatar, badge ยืนยัน, จังหวัด, วันเข้าร่วม, ประกาศ ACTIVE ทั้งหมด — ลิงก์จากชื่อผู้ขายในหน้าประกาศ
- **`sitemap.xml`** (`app/sitemap.ts`, revalidate 1 ชม.): static 6 + ประกาศ ACTIVE ทุกรายการ + บทความ published ทุกเรื่อง · **`robots.txt`** (`app/robots.ts`): allow ทั้งหมด ยกเว้น /dashboard /admin /api /login /register + ชี้ sitemap
- **หน้า static** พร้อมร่างเนื้อหา: `/about`, `/privacy` (PDPA — เก็บ/ใช้/เปิดเผย/สิทธิเจ้าของข้อมูล), `/terms` (บทบาทแพลตฟอร์ม/ความรับผิดชอบ/จำกัดความรับผิด) — **มีหมายเหตุชัดว่าเป็นร่าง ต้องให้ผู้เชี่ยวชาญกฎหมายตรวจก่อน launch (M11)**
- **404 / error / loading**: `app/not-found.tsx`, `app/error.tsx` (client), loading skeleton หน้า `/listings` + `/articles` (+ `ListingCardSkeleton`)
- `config/site.ts`: `SITE_URL` (จาก `NEXT_PUBLIC_SITE_URL`), `YOUTUBE_CHANNEL_URL`

### ทดสอบแล้ว (E2E)

- [x] หน้าแรกครบทุก section, **ไม่มี dead link จาก 32 ลิงก์** (เกณฑ์ตรวจรับ), footer /about /privacy /terms ทั้งหมด 200
- [x] **sitemap.xml = 22 URL: 13 ประกาศ ACTIVE + 3 บทความ published + 6 static** (เกณฑ์ตรวจรับผ่าน), robots ชี้ sitemap + กัน /admin
- [x] โปรไฟล์ผู้ขาย: badge + วันเข้าร่วม + 6 ประกาศ ACTIVE, seller ที่ไม่มีจริง → 404
- [x] หน้าแรกมือถือ 375px: ไม่มี h-scroll, หมวด 3 คอลัมน์, การ์ด 2 คอลัมน์, `npm run build` ผ่าน

### ⚠️ ข้อสังเกต/ความเสี่ยงที่ต้องตรวจตอน deploy (M10/M11)

1. **Soft-404 ในโหมด dev:** หน้า `/listings/[slug]` และ `/articles/[slug]` ที่ไม่มีจริง เนื้อหา not-found แสดงถูกต้อง แต่ HTTP status คืน **200 แทน 404** ในโหมด dev — ขณะที่ `/sellers/[id]` (โค้ด `notFound()` pattern เดียวกันเป๊ะ) คืน 404 ถูกต้อง สรุปว่าเป็น **artifact ของ Next 15.5 + Turbopack dev** ไม่ใช่บั๊กโค้ด แต่ **ต้องยืนยัน status 404 บน production จริงตอน deploy** (soft-404 กระทบ SEO)
2. **`next start` กับ turbopack build พัง:** รัน `npm start` (หลัง `build --turbopack`) เจอ `routesManifest.dataRoutes is not iterable` — ทดสอบ production ในเครื่องไม่ได้ **Vercel deploy ไม่ได้ใช้ `next start` ตรงๆ จึงน่าจะไม่กระทบ** แต่ต้องเฝ้าดูตอน M11 (ถ้าจะรัน self-host ต้องพิจารณาถอด `--turbopack` ออกจาก build script)

### Next step (M10 — Polish + QA)

- Responsive 360–1440px ทุกหน้า, empty states, error handling อัปรูป/network, a11y (focus ring/alt/contrast), ตรวจ N+1, **ยืนยัน 404 status บน prod**
- งานผู้ใช้ค้าง: LINE/Google (port 3000), R2, ตั้ง `NEXT_PUBLIC_SITE_URL` + `NEXT_PUBLIC_YOUTUBE_URL`, เตรียมบทความจริง

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
