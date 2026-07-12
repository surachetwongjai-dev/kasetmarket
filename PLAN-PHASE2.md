# PLAN-PHASE2.md — แผนสร้างฟีเจอร์ชุด Phase 2 (taladkaset.com)

> ใช้คู่กับ CLAUDE.md (convention ทั้งหมด) + STATUS.md — **กติกา milestone เดิมจาก PLAN.md ใช้ทุกข้อ**:
> 1 milestone = 1 session → build ผ่าน → ทดสอบตามเกณฑ์ → commit → อัปเดต STATUS.md → ค่อยไปต่อ
> เขียน 2026-07-12 จากการรีเสิร์ชแหล่งข้อมูลจริง (ลิงก์อ้างอิงอยู่ท้ายไฟล์)

## วิธีสั่งงานแต่ละ milestone (ก้อปวางใน Claude Code)

```
อ่าน CLAUDE.md, PLAN-PHASE2.md, STATUS.md แล้วทำ Milestone <รหัส> เท่านั้น
ห้ามทำเกิน scope ห้ามแตะโค้ดฟีเจอร์เดิมที่ทำงานอยู่แล้วนอกจากจุดที่แผนระบุ
เสร็จแล้ว: npm run build ให้ผ่าน, ทดสอบตามเกณฑ์ตรวจรับ, สรุปสิ่งที่ทำ, อัปเดต STATUS.md
```

---

## 0. ภาพรวม 6 ระบบ → 6 กลุ่ม milestone + ลำดับที่แนะนำ

| กลุ่ม | ระบบ (ตามที่ผู้ใช้ขอ) | Milestones | ลำดับแนะนำ | เหตุผล |
|---|---|---|---|---|
| **T** Trust & Safety | (3) Verify + คำเตือนตัวกลาง + รีวิวผู้ขาย | T0–T3 | **1** | กระทบความปลอดภัยของ core marketplace ตรงที่สุด, scope เล็ก, ฟีเจอร์อื่นต่อยอดจากมัน (รีวิวโชว์ในโปรไฟล์/กระดานจับคู่) |
| **P** ราคากลาง | (2) หน้าอัปเดตราคากลางรายวัน | P1–P3 | **2** | จุดดึง traffic ประจำวัน + SEO คำค้น "ราคาXวันนี้" มหาศาล — อยู่ในแผน Phase 2 เดิมอยู่แล้ว |
| **U** โปรไฟล์ | (5) โปรไฟล์เกษตรกร (ฟาร์ม/ไร่/ร้าน) | U1–U2 | **3** | scope เล็ก, ทำให้รีวิว+ชุมชน+จับคู่มีตัวตนน่าเชื่อถือ — ทำก่อนเปิดชุมชน |
| **B** จับคู่ซื้อขาย | (6) กระดาน Demand & Supply | B1–B2 | **4** | จุดต่างจากแพลตฟอร์มอื่น, reuse โครงประกาศเดิมได้มาก |
| **C** ชุมชน | (1) กระดานพูดคุยปัญหาเกษตร | C1–C3 | **5** | ภาระ moderation สูงสุด — สร้างเสร็จแล้วซ่อนหลัง flag เปิดเมื่อคุณพร้อมดูแล (ตามเงื่อนไขเดิมใน PLAN.md Phase 2) |
| **S** ค่าขนส่ง | (4) เช็คค่าขนส่งทุกค่าย | S1 (+S2 Phase 3) | **6** | หน้า utility อิสระ ทำเมื่อไหร่ก็ได้ — เรทเปลี่ยนบ่อย ใช้ตาราง static + วันที่อัปเดตใน MVP |

รวม **13 milestones** (~13 sessions) — B3 (แจ้งเตือน LINE) แยกเป็น Phase 2.5

**Dependency ที่บังคับลำดับ:** T0 (ContactReveal + SafetyNotice + flags) ต้องเสร็จก่อน T2 · U2 ต้องมาหลัง T2 (โชว์รีวิวในโปรไฟล์) · นอกนั้นสลับลำดับกลุ่มได้อิสระ

---

## 1. กติการ่วมทุกฟีเจอร์ (อ่านก่อนเริ่มทุก session — บังคับ)

1. **โครงสร้าง:** ทุกฟีเจอร์อยู่ `features/<name>/` ครบวงจร (queries/actions/schemas/components) · ค่าคงที่ธุรกิจใหม่ทั้งหมดอยู่ `config/` · Server Actions + zod validate ทุก mutation
2. **URL ไทยทำผ่าน rewrite เท่านั้น** (บั๊ก unicode ของ Next 15.5 — ดู CLAUDE.md §10 "การตัดสินใจจริง"): route จริงเป็น ascii, เพิ่มคู่ (ไทย↔ascii) ใน `thaiRoutes` ที่ `next.config.ts`, redirect ทางกลับ, path helper อยู่ในไฟล์ `paths.ts` ของ feature นั้น — **URL ใหม่ของ Phase 2:** `/ราคาสินค้าเกษตร`→`/prices` · `/ชุมชน`→`/community` · `/จับคู่ซื้อขาย`→`/matching` · `/เช็คค่าส่ง`→`/shipping-rates`
3. `redirect()` ที่ชี้ URL ไทยต้อง `encodeURI()` · `revalidatePath()` ใช้ path ภายใน (ascii)
4. **Feature flag ทุกกลุ่ม** ใน `config/flags.ts`: `REVIEWS`, `PRICES`, `FARM_PROFILE`, `MATCHING`, `COMMUNITY`, `SHIPPING_RATES` — ปิด flag = ซ่อนลิงก์ nav + หน้า return 404 + ไม่เข้า sitemap (สร้างเสร็จค่อยเปิดทีละตัว ไม่บล็อกกัน)
5. **Admin:** ฟีเจอร์ที่มีคิว/การจัดการ เพิ่มแท็บใน `admin/layout.tsx` + ตัวเลขค้างตรวจในหน้า `/admin` ภาพรวม
6. **Rate limit ทุกจุดที่ user สร้างเนื้อหาได้** (ตัวเลขระบุใน milestone) — แพทเทิร์นเดิม: นับจาก DB ตามวันปฏิทินไทย หรือ in-memory ต่อ IP สำหรับ endpoint ไม่ล็อกอิน
7. **ทุก query ฝั่ง public filter สถานะเผยแพร่เสมอ** (ACTIVE/VISIBLE/APPROVED แล้วแต่ model) ยกเว้น admin/dashboard
8. **Mobile-first:** touch target ≥44px, ฟอนต์ ≥16px, ฟอร์มใช้ง่ายบนมือถือ, ไม่มี horizontal scroll 360px
9. **sitemap:** หน้า public ใหม่ที่ indexable เข้าตาม flag · หน้า transactional (ฟอร์ม/สำเร็จ) `robots: noindex`
10. **ภาษา UI ไทยทั้งหมด** เก็บในคอมโพเนนต์ตรงๆ ตาม convention เดิม

---

## 2. กลุ่ม T — Trust & Safety (ระบบที่ 3: Verify + คำเตือน + รีวิว)

### หลักคิด
- **คำเตือน "เราเป็นตัวกลาง"** ต้องโผล่ตรงจุดตัดสินใจ ไม่ใช่ซ่อนใน /terms — โดยเฉพาะ**ก่อนเห็นเบอร์โทร/กด LINE** ซึ่งเป็นวินาทีที่เงินจะเปลี่ยนมือ
- **รีวิวบนแพลตฟอร์มที่ธุรกรรมจบนอกระบบ = ปลอมง่าย** ต้องยกระดับด้วยการผูกกับเหตุการณ์จริงที่ระบบเห็น (การกดแสดงเบอร์/กด LINE) + จำกัด 1 รีวิว/ผู้ซื้อ/ผู้ขาย + ระบบรายงาน
- **Verify ห้ามเก็บรูปบัตรประชาชนในระบบ** (ข้อมูลอ่อนไหว PDPA — ภาระ compliance สูงเกิน MVP) → ตรวจหลักฐานผ่าน LINE OA ของแอดมินแล้วบันทึกแค่ "ผ่าน/ไม่ผ่าน + วิธีที่ใช้ตรวจ"

### Data model (เพิ่มใน Prisma)

```prisma
// T0 — log เหตุการณ์กดดูช่องทางติดต่อ (ฐานของ gating รีวิว + สถิติ)
model ContactReveal {
  id        String   @id @default(cuid())
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  listingId String
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId    String?  // null = คนไม่ล็อกอิน (log ไว้เป็นสถิติ แต่ใช้ gate รีวิวไม่ได้)
  channel   String   // "phone" | "line"
  createdAt DateTime @default(now())
  @@index([listingId]) @@index([userId, createdAt])
}

// T2 — รีวิวผู้ขาย
model SellerReview {
  id         String   @id @default(cuid())
  seller     User     @relation("ReviewsReceived", fields: [sellerId], references: [id], onDelete: Cascade)
  sellerId   String
  reviewer   User     @relation("ReviewsGiven", fields: [reviewerId], references: [id], onDelete: Cascade)
  reviewerId String
  listing    Listing? @relation(fields: [listingId], references: [id], onDelete: SetNull)
  listingId  String?  // ประกาศที่เกี่ยว (ถ้ามี — โชว์ "ซื้ออะไร")
  rating     Int      // 1-5
  comment    String?  @db.Text
  sellerReply String? @db.Text // ผู้ขายตอบได้ 1 ครั้ง
  hidden     Boolean  @default(false) // แอดมินซ่อน
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([sellerId, reviewerId]) // 1 รีวิวต่อคู่ (แก้ไขรีวิวเดิมได้)
  @@index([sellerId, hidden, createdAt])
}

model ReviewReport {
  id        String   @id @default(cuid())
  review    SellerReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId  String
  reason    String
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
}

// T3 — คิวขอยืนยันตัวตน
model VerificationRequest {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  note       String?  @db.Text // ผู้ขอเล่าว่าขายอะไร มีหลักฐานอะไร
  method     String?  // แอดมินบันทึกวิธีตรวจ เช่น "วิดีโอคอล LINE + เห็นสวนจริง" (ห้ามเก็บไฟล์บัตร)
  status     String   @default("PENDING") // PENDING | APPROVED | REJECTED
  createdAt  DateTime @default(now())
  reviewedAt DateTime?
  @@index([status, createdAt])
}
```

### T0+T1 — SafetyNotice ทุกจุด + ContactReveal log *(1 session — T0 กับ T1 ทำรวมกัน)*

**สั่งให้ทำ:**
- `config/flags.ts` เพิ่ม flag ทั้ง 6 ตัว (ปิดหมด ยกเว้นไม่มีผลกับ T1 ซึ่งเปิดใช้ทันที — คำเตือนไม่ต้องมี flag)
- `features/trust/components/safety-notice.tsx` — คอมโพเนนต์เดียว หลาย variant:
  - `variant="banner"`: การ์ดเหลืองทอง ข้อความหลัก **"taladkaset เป็นตัวกลางให้ผู้ซื้อ-ผู้ขายเจอกันเท่านั้น ตกลงราคา/ขนส่งกันเอง — อย่าโอนเงินมัดจำจนกว่าจะเห็นสินค้าหรือมั่นใจในตัวผู้ขาย"** + ลิงก์ "วิธีซื้อขายปลอดภัย"
  - `variant="pre-reveal"`: ข้อความสั้นที่บังคับเห็นก่อนเบอร์โผล่ (แทรกใน `ContactButtons` ระหว่างจังหวะกด "แสดงเบอร์" → เห็นคำเตือน + ปุ่มยืนยัน → เห็นเบอร์)
- จุดวาง (ครบทุกหน้าที่มีการติดต่อ): หน้าประกาศรายตัว (แทนที่ข้อความเตือนเดิมด้วย banner), หน้าร้าน directory, หน้า MatchPost (เมื่อมี B2), ก่อน reveal เบอร์ทุกที่ที่ใช้ `ContactButtons`
- หน้า static ใหม่ `/safety` — "วิธีซื้อขายปลอดภัย" ~10 ข้อ (นัดเจอที่ปลอดภัย, ตรวจสินค้าก่อนจ่าย, เช็ครีวิว/badge, สัญญาณมิจฉาชีพ, ช่องทางแจ้งความ) + ลิงก์จาก footer
- `ContactReveal`: migrate + `POST /api/listings/[id]/reveal` (บันทึก channel, userId ถ้าล็อกอิน — เรียกจาก `ContactButtons` ตอนกดยืนยันดูเบอร์/กด LINE ด้วย `sendBeacon` แพทเทิร์นเดียวกับ ViewTracker) — กันสแปมด้วย unique ต่อ session ฝั่ง client + rate limit IP ฝั่ง server

**เกณฑ์ตรวจรับ:** เปิดหน้าประกาศเห็น banner · กด "แสดงเบอร์" เจอคำเตือนก่อนเสมอ → ยืนยัน → เบอร์โผล่ + แถว ContactReveal ลง DB (มี/ไม่มี userId ทั้งสองเคส) · /safety เข้าถึงได้จาก footer · build ผ่าน
**Commit:** `T1: safety notices + contact reveal log`

### T2 — ระบบรีวิวผู้ขาย *(1 session)*

**สั่งให้ทำ:**
- migrate `SellerReview` + `ReviewReport` · `features/trust/` (schemas/actions/queries/components)
- **กติกาการรีวิว (สำคัญ — กันรีวิวปลอม):**
  1. ต้องล็อกอิน
  2. ต้องมี `ContactReveal` ของตัวเองบนประกาศใดๆ ของผู้ขายคนนั้น **อายุ ≥ 24 ชม.** (เผื่อเวลาซื้อขายจริง)
  3. รีวิวผู้ขายคนเดิมได้ 1 ครั้ง (แก้ไข/ลบของตัวเองได้ — คะแนนคำนวณใหม่)
  4. ห้ามรีวิวตัวเอง
  5. rating 1-5 บังคับ, comment ≤1,000 ตัวอักษร optional
- แสดงผล: ดาวเฉลี่ย (ทศนิยม 1 ตำแหน่ง) + จำนวนรีวิว บน (ก) หน้าโปรไฟล์ผู้ขาย — list รีวิวทั้งหมด + ตอบกลับของผู้ขาย (ข) กล่องผู้ขายในหน้าประกาศรายตัว (ดาว + จำนวน + ลิงก์ไปโปรไฟล์)
- ป้ายกำกับใต้ทุกรีวิว: "รีวิวจากผู้ที่กดดูช่องทางติดต่อผ่านแพลตฟอร์ม" (บอกความหมายตรงๆ ไม่เคลมเกินจริงว่า 'ผู้ซื้อจริง')
- ผู้ขายตอบรีวิวได้ 1 ครั้ง/รีวิว (แก้ได้) · ปุ่มรายงานรีวิว (ไม่ต้องล็อกอิน, เหตุผลจาก list) → คิวแอดมิน
- แอดมิน: แท็บย่อยในหน้า `/admin/reports` หรือแท็บใหม่ "รีวิว" — ซ่อน/เลิกซ่อนรีวิว, resolve รายงาน
- อยู่หลัง `FLAGS.REVIEWS` — ปิด = ซ่อน UI ทั้งหมด (ข้อมูลเดิมคงอยู่)
- rate limit: เขียน/แก้รีวิวรวม 5 ครั้ง/วัน/user

**เกณฑ์ตรวจรับ:** user ที่ไม่เคยกดดูเบอร์ → ฟอร์มรีวิวไม่ขึ้น (บอกเหตุผล+วิธี) · กดดูเบอร์แล้ว <24 ชม. → ยังรีวิวไม่ได้ · ครบเงื่อนไข → รีวิวได้ → ดาวเฉลี่ยบนโปรไฟล์+หน้าประกาศถูกต้อง → รีวิวซ้ำ = แก้รีวิวเดิม · ผู้ขายตอบได้ · รายงาน → แอดมินซ่อน → หายจากหน้าเว็บ · build ผ่าน
**Commit:** `T2: seller reviews`

### T3 — Verify flow เต็มระบบ *(1 session)*

**สั่งให้ทำ:**
- migrate `VerificationRequest` · dashboard ผู้ขาย: การ์ด "ยืนยันตัวตน" — อธิบายประโยชน์ (badge ✓, ประกาศขึ้นทันทีไม่รอคิว) + ฟอร์มส่งคำขอ (note บอกว่าขายอะไร) → PENDING → ระบบแสดงขั้นถัดไป: "ทีมงานจะติดต่อทาง LINE OA ภายใน 2 วัน เตรียมหลักฐาน เช่น รูปสวน/ฟาร์ม/หน้าร้าน" (**ห้ามมีช่องอัปโหลดเอกสาร/บัตรใดๆ**)
- แอดมิน: แท็บ "ยืนยันตัวตน" — คิว PENDING (เห็นโปรไฟล์+ประกาศ+รีวิวของคนขอ), ปุ่ม อนุมัติ (บังคับกรอก `method`) / ปฏิเสธ → อนุมัติแล้ว `User.verified=true` (กลไก badge + ข้ามคิวประกาศทำงานเองตาม M5/M7 เดิม)
- หน้าอธิบายเกณฑ์ verify สาธารณะสั้นๆ (รวมใน /safety ได้) — โปร่งใสว่า badge แปลว่าอะไร/ไม่แปลว่าอะไร (ไม่ใช่การการันตีของแพลตฟอร์ม)
- แจ้งผลใน dashboard (สถานะคำขอ + เหตุผลถ้าปฏิเสธ)

**เกณฑ์ตรวจรับ:** seller ส่งคำขอ → เห็นสถานะรอตรวจ · แอดมินอนุมัติพร้อม method → badge ✓ ขึ้นทุกจุดทันที + ประกาศตัวถัดไปเป็น ACTIVE · ปฏิเสธ → ผู้ขอเห็นเหตุผล ส่งใหม่ได้ · ไม่มีที่ให้อัปโหลดไฟล์เอกสารใดๆ ในระบบ · build ผ่าน
**Commit:** `T3: verification request flow`

---

## 3. กลุ่ม P — ราคากลางสินค้าเกษตรรายวัน (ระบบที่ 2)

### แหล่งข้อมูลจริง (รีเสิร์ช 2026-07-12)

| แหล่ง | รูปแบบ | ครอบคลุม | หมายเหตุ |
|---|---|---|---|
| **กระทรวงพาณิชย์ MOC Open Data** | REST API: `GET https://dataapi.moc.go.th/gis-product-price?product_id=...&from_date=...&to_date=...` | ราคาขายปลีก/ขายส่ง + สินค้าเกษตร รายวัน | ต้อง**ทดลองยิงจริงใน P3** (เอกสารไม่ระบุชัดเรื่อง key) — fallback ติดต่อ tradeservices@moc.go.th |
| **NABC (สศก.)** | เว็บ `nabc.go.th/daily-price` + CKAN `nabc-catalog.oae.go.th` + `agriapi.nabc.go.th` | ราคารายวัน ณ ตลาดสำคัญ + ราคาที่เกษตรกรขายได้ | มี dataset format API — probe ใน P3 |
| **ราคาสมาคม** (ไข่ไก่คละหน้าฟาร์ม, สุกรหน้าฟาร์ม, ไก่เนื้อ) | ประกาศผ่านข่าว/เพจสมาคม | ปศุสัตว์ | ไม่มี API — **กรอกมือ** (เปลี่ยนไม่บ่อย ประกาศเป็นรอบ) |
| ตลาดไท / ตลาดสี่มุมเมือง | หน้าเว็บ | ขายส่งผัก-ผลไม้ | scraping เปราะ — ใช้เป็นแหล่งอ้างอิงตอนกรอกมือ |

**ยุทธศาสตร์:** MVP ยืนบน **admin กรอกมือ (เร็ว เชื่อถือได้ ที่มาชัด)** — ออกแบบหน้ากรอกให้จบใน ≤10 นาที/วัน แล้วค่อยเสริม import อัตโนมัติ (P3) เฉพาะรายการที่ API มีข้อมูลตรง

### Data model

```prisma
model PriceItem {
  id       String  @id @default(cuid())
  slug     String  @unique // ไทย เช่น "ไข่ไก่คละหน้าฟาร์ม"
  name     String
  category String  // จาก config/priceCategories.ts: ข้าว-พืชไร่ | ผัก | ผลไม้ | ปศุสัตว์ | ประมง | อื่นๆ
  unit     String  // "บาท/กก." "บาท/ฟอง" "บาท/ตัน" (แสดงผลตรงๆ)
  sourceName String? // แหล่งอ้างอิงหลัก เช่น "กรมการค้าภายใน" "สมาคมผู้ผลิตไข่ฯ"
  sourceUrl  String?
  mocProductId String? // สำหรับ import อัตโนมัติ P3 (map กับ product_id ของ MOC)
  active   Boolean @default(true)
  order    Int     @default(0)
  entries  PriceEntry[]
}

model PriceEntry {
  id       String    @id @default(cuid())
  item     PriceItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  itemId   String
  date     DateTime  @db.Date
  priceMin Decimal
  priceMax Decimal?  // ราคาเดียวใส่ min อย่างเดียว
  note     String?   // เช่น "ปรับขึ้นตามประกาศสมาคม"
  @@unique([itemId, date])
  @@index([itemId, date(sort: Desc)])
}
```

### P1 — Schema + Admin CMS กรอกราคา *(1 session)*

**สั่งให้ทำ:**
- migrate 2 model + `config/priceCategories.ts` (6 หมวด) + seed `PriceItem` เริ่มต้น ~25 รายการ (ข้าวเปลือกหอมมะลิ/เหนียว/เจ้า 5%, มันสำปะหลัง, ข้าวโพดเลี้ยงสัตว์, อ้อย, ยางแผ่นดิบ, ปาล์มทะลาย, ทุเรียนหมอนทอง, มังคุด, ลำไย, กล้วยหอม, มะม่วงน้ำดอกไม้, มะนาว, พริกขี้หนู, คะน้า, กะหล่ำปลี, สุกรหน้าฟาร์ม, ไก่เนื้อหน้าฟาร์ม, **ไข่ไก่คละหน้าฟาร์ม**, โคเนื้อ, ปลานิล, ปลาดุก, กุ้งขาว 70 ตัว/กก. ฯลฯ) พร้อม unit + sourceName
- แอดมิน แท็บ "ราคากลาง": **หน้ากรอกรายวันแบบตารางเดียวจบ** — ทุก item เรียงตามหมวด, ช่อง min/max ต่อแถว, prefill ค่าล่าสุดของเมื่อวาน (แก้เฉพาะตัวที่เปลี่ยน), ปุ่มบันทึกทีเดียวทั้งหน้า (upsert ตามวันที่ที่เลือก, ค่าว่าง = ไม่บันทึกรายการนั้น) + จัดการ PriceItem (เพิ่ม/แก้/ปิด active)
- Server Action + zod (ราคา > 0, max ≥ min) — admin only

**เกณฑ์ตรวจรับ:** กรอกราคา 5 รายการ+บันทึก → ลง DB ถูกวัน · กรอกซ้ำวันเดิม = ทับค่าเดิมไม่ duplicate · prefill โชว์ค่าเมื่อวาน · build ผ่าน
**Commit:** `P1: price schema + admin daily entry`

### P2 — หน้า public ราคากลาง *(1 session)*

**สั่งให้ทำ:**
- URL ไทย `/ราคาสินค้าเกษตร` → route จริง `/prices` (rewrite ตามแพทเทิร์น) + `/ราคาสินค้าเกษตร/[slug]` → `/prices/[slug]`
- **หน้ารวม** (ISR 1 ชม. + revalidate เมื่อแอดมินบันทึก): จัดกลุ่มตามหมวด — ตาราง: ชื่อ, ราคาวันล่าสุด (min–max), **เปลี่ยนจากครั้งก่อน (▲เขียว/▼แดง/—)**, วันที่ของราคา · header บอกวันที่อัปเดตล่าสุด · SafetyNotice ไม่ต้อง แต่มี disclaimer "ราคาอ้างอิง อาจต่างตามพื้นที่/คุณภาพ"
- **หน้ารายตัว**: ราคาวันล่าสุดตัวใหญ่ (สไตล์ป้ายราคาทอง — signature เดิม), ตาราง 30 วันย้อนหลัง, **sparkline SVG เขียนเอง** (ห้ามเพิ่ม chart lib), แหล่งอ้างอิง+ลิงก์, cross-link: ประกาศขายหมวดที่ map + บทความ (reuse แพทเทิร์น mapping D3 — เพิ่ม `relatedListingCategory` ใน PriceItem หรือ map ผ่าน config)
- SEO: title หน้ารายตัว `"ราคา{ชื่อ}วันนี้ ล่าสุด {เดือน ปี} — ย้อนหลัง 30 วัน"` + JSON-LD `Dataset` + sitemap (เฉพาะ item ที่มี entry) + `FLAGS.PRICES`
- หน้าแรกเว็บ: แถบ "ราคาวันนี้" ตัวเด่น 4-5 รายการ (ไข่ หมู ข้าว ทุเรียน) ลิงก์เข้าหน้ารวม — เพิ่มเมื่อ flag เปิด

**เกณฑ์ตรวจรับ:** กรอกราคา 2 วันติด → หน้ารวมโชว์ลูกศรเปลี่ยนแปลงถูกทิศ · หน้ารายตัวมีตาราง+sparkline+cross-link · รายการไม่มีข้อมูล → ไม่โชว์/ไม่เข้า sitemap · Rich Results เจอ Dataset · มือถือ 360px ตารางไม่ล้น (แนวนอน scroll ในกรอบ) · build ผ่าน
**Commit:** `P2: public price pages`

### P3 — Import อัตโนมัติ + cron *(1 session — ทำหลังเว็บมีโดเมนจริง)*

**สั่งให้ทำ:**
- สคริปต์ probe `dataapi.moc.go.th/gis-product-price` + CKAN NABC จริง → บันทึกผลใน STATUS.md (ใช้ได้/ไม่ได้/ต้องขอ key)
- ถ้าใช้ได้: `scripts/import-prices.ts` — map `mocProductId` → upsert PriceEntry (เฉพาะ item ที่ตั้ง id ไว้) + route handler `/api/cron/import-prices` (ตรวจ `CRON_SECRET` header) + `vercel.json` cron เรียกทุกวัน 07:00 ไทย + log ผลให้แอดมินเห็นว่ารายการไหน import อัตโนมัติ/รายการไหนยังต้องกรอกมือ
- ถ้าใช้ไม่ได้: จบที่บันทึกผล + คงกรอกมือ (ตัดสินใจแล้วไม่ต้องเดา)

**เกณฑ์ตรวจรับ:** รัน import แล้ว entry ลงถูก item ถูกวัน ไม่ทับค่าที่แอดมินกรอกมือในวันเดียวกัน (มือชนะเสมอ) · ยิง cron endpoint โดยไม่มี secret → 401 · build ผ่าน
**Commit:** `P3: price auto-import + cron`

---

## 4. กลุ่ม U — โปรไฟล์เกษตรกร (ระบบที่ 5)

### Data model

```prisma
model FarmProfile {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String   @unique
  bio       String?  @db.Text // แนะนำตัว/กิจการ ≤1,000 ตัวอักษร
  farmTypes String[] // จาก config/farmTypes.ts: นาข้าว|สวนผลไม้|ไร่พืชไร่|ฟาร์มปศุสัตว์|บ่อปลา-กุ้ง|ร้านค้าเกษตร|โรงงาน-ผู้รับซื้อ|อื่นๆ
  products  String?  // สินค้าหลักที่ทำ (text สั้น)
  sizeRai   Int?     // ขนาดพื้นที่ (ไร่)
  province  String?
  district  String?
  images    FarmProfileImage[] // ≤4 รูป (สวน/ฟาร์ม/หน้าร้าน)
  updatedAt DateTime @updatedAt
}
model FarmProfileImage { id String @id @default(cuid()) ... order Int ... (แพทเทิร์น ListingImage) }
```

### U1 — Schema + ฟอร์มแก้โปรไฟล์ *(รวม U2 ได้ใน 1-2 session)*

- migrate + `config/farmTypes.ts` + `features/profile/` + หน้า `/dashboard/profile`: ฟอร์มแก้ (ชื่อที่แสดง (User.name), จังหวัด (User.province), + FarmProfile ทุก field, รูป ≤4 reuse `ImageUploader`) — zod + rate limit แก้ 10 ครั้ง/วัน
- **เกณฑ์:** แก้แล้วเซฟ → โชว์หน้า public ทันที (revalidate) · build ผ่าน · **Commit:** `U1: farm profile schema + edit form`

### U2 — หน้าโปรไฟล์ public โฉมใหม่

- ปรับ `/sellers/[id]`: ส่วนหัว (avatar, ชื่อ, badge ✓, ดาวรีวิว+จำนวน (จาก T2), จังหวัด, สมาชิกตั้งแต่) → chips ประเภทกิจการ + bio + รูปฟาร์ม (gallery reuse) → **"กำลังขายตอนนี้"** = ประกาศ ACTIVE (ของเดิม) + ถ้ามี MatchPost ACTIVE (จาก B) โชว์ด้วย → รีวิวทั้งหมด → ปุ่มรายงานโปรไฟล์ (reuse Report แนวเดียวกับประกาศ)
- ผู้ใช้ที่ไม่มี FarmProfile = หน้าเดิม (ไม่พังของเก่า) · `FLAGS.FARM_PROFILE` คุมเฉพาะ section ใหม่
- **เกณฑ์:** โปรไฟล์มี/ไม่มีข้อมูลฟาร์ม แสดงถูกทั้งคู่ · ดาวรีวิวตรงกับ T2 · มือถือไม่ล้น · build ผ่าน · **Commit:** `U2: public farmer profile`

---

## 5. กลุ่ม B — กระดานจับคู่ซื้อขาย (ระบบที่ 6)

### หลักคิด
- **MVP = กระดานโครงสร้างดี + filter แม่น ไม่มีอัลกอริทึมจับคู่อัตโนมัติ** (คนจับคู่กันเองผ่านโทร/LINE) — อัลกอริทึม/แจ้งเตือนอัตโนมัติเป็น B3 (Phase 2.5)
- reuse ทุกอย่างจากระบบประกาศ: หมวด, จังหวัด, สถานะ+คิว moderation, rate limit, ContactButtons+SafetyNotice, slug ไทย

### Data model

```prisma
enum MatchPostType { SUPPLY DEMAND } // SUPPLY = เกษตรกรเสนอผลผลิต(ล่วงหน้า) | DEMAND = ผู้รับซื้อประกาศรับซื้อ
enum MatchPostStatus { PENDING ACTIVE MATCHED EXPIRED REJECTED }

model MatchPost {
  id        String   @id @default(cuid())
  slug      String   @unique
  type      MatchPostType
  title     String   // "มะม่วงน้ำดอกไม้พร้อมตัด 5 ตัน กลางเดือนหน้า"
  detail    String   @db.Text // สเปค: เกรด ความชื้น ขนาด บรรจุ ฯลฯ
  category  String   // reuse config/categories.ts
  province  String
  district  String?
  quantity  String   // free text มีหน่วย เช่น "5 ตัน" "300 กก./สัปดาห์" (ยืดหยุ่นกว่า number)
  targetDate DateTime? // SUPPLY: พร้อมส่งเมื่อไหร่ | DEMAND: ต้องการภายใน
  priceNote String?  // "ราคาตามตลาด" / "เสนอราคามา" — ไม่บังคับตัวเลข
  contactPhone String?
  contactLine  String?
  status    MatchPostStatus @default(PENDING)
  rejectReason String?
  featured  Boolean  @default(false)
  views     Int      @default(0)
  expiresAt DateTime // +30 วัน ต่ออายุได้ (แพทเทิร์นประกาศ)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([type, category, province, status])
  @@index([status, createdAt])
}
```

### B1 — Schema + โพส/จัดการ + moderation *(1 session)*

- migrate + `features/matching/` ครบ · ฟอร์มโพสใน dashboard (เลือก type ก่อน — label ภาษาคน: "ผมมีผลผลิตจะขาย (ล่วงหน้าได้)" / "ผมต้องการรับซื้อ") · กติกาเดิมทั้งชุด: verified→ACTIVE, ไม่ verified→PENDING, บังคับช่องทางติดต่อ ≥1, rate limit 3 โพสต์/วัน, จัดการของตัวเอง (แก้/MATCHED ("จับคู่แล้ว")/ต่ออายุ/ลบ) · แอดมิน: รวมเข้าคิว `/admin/moderation` เดิม (แท็บย่อย หรือ section แยกในหน้าเดียว — เลือกทางที่แตะโค้ดเดิมน้อยสุด) + reject พร้อมเหตุผล
- **เกณฑ์:** โพสทั้ง 2 type ครบ flow PENDING→approve→ACTIVE · กด "จับคู่แล้ว" → หายจากบอร์ด · rate limit ตัวที่ 4 โดนบล็อก · build ผ่าน · **Commit:** `B1: match post schema + CRUD + moderation`

### B2 — หน้ากระดาน + SEO + cross-link *(1 session)*

- URL `/จับคู่ซื้อขาย` → `/matching` (+ `/[slug]` รายตัว) · หน้าบอร์ด: 2 แท็บ (🌾 ผลผลิตเสนอขาย / 🏭 ประกาศรับซื้อ) + filter หมวด/จังหวัด + เรียง targetDate ใกล้สุด/ใหม่สุด · การ์ด: type badge สี, ชื่อ, ปริมาณ, จังหวัด, targetDate ("พร้อมตัด ~15 ส.ค."), ผู้โพส+badge ✓+ดาว
- รายตัว: รายละเอียดเต็ม + SafetyNotice + ContactButtons (sticky) + ContactReveal log + โปรไฟล์ผู้โพส + **cross-link**: MatchPost หมวด+จังหวัดใกล้เคียงฝั่งตรงข้าม ("มีผู้รับซื้อในหมวดนี้ 3 ราย") + ประกาศขายปกติหมวดเดียวกัน
- จุดดึงเข้า: nav header + หน้าแรก section เล็ก + หน้าประกาศหมวดเดียวกันมีลิงก์ "มีคนประกาศรับซื้อหมวดนี้ N ราย →" · sitemap + ISR 300s + `FLAGS.MATCHING`
- **เกณฑ์:** filter ทุกคอมโบถูก · reveal เบอร์มีคำเตือนก่อน · cross-link สองฝั่งเจอกันถูกหมวด+จังหวัด · build ผ่าน · **Commit:** `B2: matching board pages`

### B3 — แจ้งเตือนจับคู่ผ่าน LINE *(Phase 2.5 — ยังไม่ทำในรอบนี้)*
สเปคไว้ก่อน: ผู้ใช้ subscribe หมวด+จังหวัด → มี MatchPost/ประกาศใหม่ตรงเงื่อนไข → push ผ่าน LINE Messaging API (มี quota/ต้นทุน — ตัดสินใจตอนมีผู้ใช้จริง)

---

## 6. กลุ่ม C — ชุมชนพูดคุย (ระบบที่ 1)

### หลักคิด
- ฟอรัมถามตอบเบา ไม่ใช่ Discourse — โพสได้เมื่อล็อกอิน (LINE = friction ต่ำ), อ่านได้ทุกคน, SEO ได้จากกระทู้
- **สร้างเสร็จซ่อนหลัง `FLAGS.COMMUNITY`** — เปิดเมื่อคุณพร้อมตอบ/ดูแลสม่ำเสมอ (เงื่อนไขเดิมใน PLAN.md: "เปิดเมื่อมีคนดูแลตอบสม่ำเสมอ") และควร seed กระทู้คุณภาพ 10-15 กระทู้ก่อนเปิด (แปลงจากคอมเมนต์เด่นใน YouTube ได้)

### Data model

```prisma
model Thread {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  body      String   @db.Text // plain text + ขึ้นบรรทัด (ไม่ใช่ markdown)
  category  String   // config/forumCategories.ts: ข้าว|พืชไร่|ผัก-ผลไม้|ปศุสัตว์-ประมง|ปุ๋ย-ยา-โรคพืช|เครื่องจักร-เทคโนโลยี|ราคา-การตลาด|คุยทั่วไป
  images    ThreadImage[] // ≤3
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  pinned    Boolean  @default(false)
  locked    Boolean  @default(false) // ปิดตอบ
  hidden    Boolean  @default(false) // แอดมินซ่อน
  views     Int      @default(0)
  repliesCount Int   @default(0) // denormalize
  lastReplyAt  DateTime @default(now()) // ใช้เรียงหน้า list
  createdAt DateTime @default(now())
  @@index([category, hidden, lastReplyAt(sort: Desc)])
  @@index([hidden, lastReplyAt(sort: Desc)])
}
model ThreadImage { ... (แพทเทิร์น ListingImage) }
model ThreadReply {
  id String @id @default(cuid())
  thread Thread @relation(... onDelete: Cascade); threadId String
  author User @relation(...); authorId String
  body String @db.Text
  hidden Boolean @default(false)
  createdAt DateTime @default(now())
  @@index([threadId, createdAt])
}
model ForumReport { id, threadId?, replyId?, reason, resolved, createdAt } // อย่างใดอย่างหนึ่งไม่ null
```

### C1 — Schema + กระดาน + โพส/ตอบ *(1 session)*
- migrate + `config/forumCategories.ts` + `features/community/` · URL `/ชุมชน` → `/community`: hub (แท็บหมวด + list เรียง pinned→lastReplyAt + การ์ด: หัวข้อ, หมวด, ผู้โพส+badge, ตอบ N, เวลาเคลื่อนไหวล่าสุด + pagination) · `/ชุมชน/[slug]` กระทู้: เนื้อหา+รูป → replies เรียงเก่าไปใหม่ → ฟอร์มตอบ (ล็อกอิน) · ฟอร์มตั้งกระทู้ (ล็อกอิน): หัวข้อ ≤120, เนื้อหา ≤5,000, หมวด, รูป ≤3 (endpoint ล็อกอิน) · **โพสขึ้นทันที** (post-moderation — user แบนโพสไม่ได้อยู่แล้วจากระบบแบน M7) · rate limit: 5 กระทู้ + 30 ตอบ/วัน · view counter reuse ViewTracker
- **เกณฑ์:** ตั้งกระทู้→ขึ้นบอร์ดทันที→ตอบ→repliesCount/lastReplyAt อัปเดต+กระทู้เด้งขึ้นบน · ไม่ล็อกอิน→อ่านได้ ตอบไม่ได้ (ชวนล็อกอิน) · build ผ่าน · **Commit:** `C1: community board + threads + replies`

### C2 — Moderation + รายงาน *(1 session)*
- ปุ่มรายงานกระทู้/คำตอบ (ไม่ต้องล็อกอิน, กันซ้ำ/วัน) → แอดมินแท็บ "ชุมชน": คิวรายงาน + ซ่อน/เลิกซ่อน + ปักหมุด/ล็อก + ลบ · ผู้เขียนแก้/ลบของตัวเองได้ (แก้ได้ภายใน 24 ชม. กันย้อนแก้ประวัติ) · การ์ดกติกาชุมชน (สั้น 5 ข้อ) แสดงหน้าตั้งกระทู้ + ลิงก์จาก hub
- **เกณฑ์:** flow รายงาน→ซ่อน→หายจาก public + กระทู้ hidden เข้าตรง URL → 404 · ล็อกกระทู้→ฟอร์มตอบหาย · build ผ่าน · **Commit:** `C2: community moderation`

### C3 — SEO + จุดดึงเข้า + เปิดตัว *(0.5 session)*
- กระทู้ ISR 300s + revalidate เมื่อมีตอบ/แก้ · JSON-LD `DiscussionForumPosting` · sitemap (เฉพาะไม่ hidden) · หน้าแรก: section "จากชุมชน" 3 กระทู้ล่าสุด (เมื่อ flag เปิด) · หน้าบทความ: ลิงก์ "คุยเรื่องนี้ในชุมชน" ตามหมวด map
- **งานของคุณก่อนเปิด flag:** seed กระทู้จริง 10-15 + ตั้งเวลาตอบทุกวัน ช่วงแรกอย่างน้อย 2 สัปดาห์
- **Commit:** `C3: community seo + entry points`

---

## 7. กลุ่ม S — เช็คค่าขนส่ง (ระบบที่ 4)

### ข้อเท็จจริงจากรีเสิร์ช (2026-07)
- **Shippop** (developers.shippop.com) = shipping gateway API เดียวเชื่อมได้หลายค่าย (Flash, J&T, Kerry/KEX, ไปรษณีย์ไทย, SCG, Ninja Van, Best ฯลฯ) — เหมาะเป็น **S2 (Phase 3)**: ต้องเปิดบัญชี merchant, ได้ส่วนแบ่ง/เรทพิเศษ = ช่องทาง monetization
- เรทมาตรฐานที่ประกาศสาธารณะ (กลางปี 2569): Flash เริ่ม ~22-25฿ · **ไปรษณีย์ไทยมี "EMS ส่งด่วนผลไม้" เริ่ม 60฿/3กก. + กล่องผลไม้เฉพาะ** · KEX มีแคมเปญส่งผลไม้ · **Nim Express = รถห้องเย็น/ของสด ส่งข้ามจังหวัดใน 1 วัน** (สำคัญกับผู้ใช้เกษตรมาก) — เรทพวกนี้**เปลี่ยนบ่อย** จึงห้าม hardcode ในหน้า ให้เก็บ config เดียว + โชว์วันที่อัปเดต + ลิงก์เช็คจริงของแต่ละค่าย

### S1 — หน้าเช็คค่าส่ง (ตาราง static + เครื่องคิด) *(1 session)*

**สั่งให้ทำ:**
- `config/shippingRates.ts`: ต่อค่าย — name, slug, url เช็คราคาทางการ, phone, จุดเด่น (`freshSupport` ส่งของสด/ผลไม้, `codSupport`, `coldChain`), `volumetricDivisor`, `updatedAt`, ตารางเรทตามช่วงน้ำหนัก (kg) + surcharge หมายเหตุพื้นที่ห่างไกล — ใส่ค่ายหลัก: ไปรษณีย์ไทย (ธรรมดา/EMS/EMS ผลไม้), Flash, J&T, KEX, Best, Nim Express (ระบุ "เรทโดยประมาณ ติดต่อสาขา"), Inter Express
- URL `/เช็คค่าส่ง` → `/shipping-rates`: **เครื่องคิดฝั่ง client** — กรอกน้ำหนัก + ขนาด (ก×ย×ส ซม. optional) → คำนวณน้ำหนักตามปริมาตรต่อค่าย → ตารางผลเรียงถูก→แพง: ค่าย, ราคาประมาณ, ป้าย "รับของสด/ผลไม้ 🍎" "COD ✓" "ห้องเย็น ❄️", ลิงก์ "เช็คเรทจริง →" · ส่วนล่าง: คู่มือสั้น "ส่งผลไม้/ของสดเลือกเจ้าไหน" (คอนเทนต์ SEO จากข้อเท็จจริงข้างบน)
- Disclaimer เด่น: "เรทมาตรฐานหน้าเคาน์เตอร์ อัปเดต {updatedAt จาก config} — เรทจริงอาจต่างตามโปรโมชั่น/พื้นที่/ขนาดจริง" · `FLAGS.SHIPPING_RATES` · ลิงก์จากหน้าประกาศรายตัว ("เช็คค่าส่งโดยประมาณ →") + footer
- **ไม่ทำใน S1:** เรียก API ค่ายใดๆ, คิดตามพิกัดต้นทาง-ปลายทาง (เรทหลักของไทยเป็น flat ตามน้ำหนัก), COD คำนวณ

**เกณฑ์ตรวจรับ:** กรอก 2กก. ไม่ใส่ขนาด → เรียงราคาถูกต้องตาม config · ใส่ขนาดใหญ่ → ค่ายที่คิด volumetric ราคาขยับ · ทุกลิงก์ค่ายเปิดเว็บทางการ · มือถือใช้สะดวก · build ผ่าน
**Commit:** `S1: shipping rate checker (static rates)`

### S2 — Shippop API *(Phase 3 — สเปคไว้ก่อน ยังไม่ทำ)*
เชื่อม rate API จริง + ปุ่ม "จองส่งเลย" (ได้ค่าคอม) — ต้องสมัคร merchant Shippop ก่อน (งานฝั่งคุณ)

---

## 8. ความเสี่ยงรวม + สิ่งที่ห้ามทำ (scope guard)

| ความเสี่ยง | การจัดการที่เลือกแล้ว |
|---|---|
| รีวิวปลอม/กลั่นแกล้ง | gate ด้วย ContactReveal ≥24ชม. + 1รีวิว/คู่ + รายงาน + แอดมินซ่อน — **ไม่เคลม "ผู้ซื้อจริง 100%"** ใน copy |
| PDPA (verify) | **ห้ามเก็บไฟล์บัตร/เอกสารในระบบเด็ดขาด** — ตรวจนอกระบบ บันทึกแค่ผล+วิธี |
| ราคากลางผิด/ไม่อัปเดต | โชว์วันที่ของราคาทุกจุด + แหล่งอ้างอิง + disclaimer · ไม่มีข้อมูล = ไม่โชว์ (ห้ามโชว์ราคาเก่าเงียบๆ เกิน 7 วัน — ให้ขึ้น "ไม่ได้อัปเดต") |
| เรทขนส่งเปลี่ยน | config เดียว + updatedAt เด่น + ลิงก์เช็คจริง — ตั้งรอบทบทวนทุกเดือน (งานฝั่งคุณ) |
| ฟอรัมร้าง/สแปม | ซ่อนหลัง flag จนพร้อม + seed กระทู้ + rate limit + ระบบแบนเดิม |
| Scope creep | **ห้ามทำ:** แชทในเว็บ, แจ้งเตือน push/LINE (B3=Phase 2.5), อัลกอริทึมจับคู่อัตโนมัติ, ระบบจ่ายเงิน, i18n, chart library, markdown editor ให้ user |

**ข้อควรระวังทางเทคนิค (จากบทเรียนจริงใน repo):** URL ไทย→rewrite เท่านั้น · `.env.production-db` ห้ามเปลี่ยนชื่อกลับ · เทส prod build ในเครื่องต้อง override DB + `AUTH_TRUST_HOST=true` · ห้ามรัน build ขณะ dev server เปิด · migration ใหม่ทุกตัวต้องรันกับ prod DB ตอน deploy (จดใน STATUS ทุกครั้ง)

## 9. งานฝั่งคุณ (เจ้าของ) — ทำคู่ขนาน

- [ ] **P:** ตัดสินใจ list สินค้า ~25 ตัวแรก + จัดเวลา ~10 นาที/วัน กรอกราคา (จนกว่า P3 จะลดภาระ) — นี่คือฟีเจอร์ที่ "ต้องเลี้ยงทุกวัน" ชัดเจนที่สุด
- [ ] **T:** ตั้ง LINE OA สำหรับรับหลักฐาน verify + เขียนเกณฑ์ว่าอะไรถึงผ่าน (เช่น วิดีโอคอลเห็นสวนจริง / เอกสารทะเบียนพาณิชย์โชว์ให้ดู)
- [ ] **C:** เตรียมกระทู้ seed 10-15 เรื่อง + คอมมิตเวลาตอบช่วงเปิดตัว
- [ ] **S:** ตรวจเรทใน config เดือนละครั้ง / **S2:** สมัคร Shippop merchant เมื่อถึง Phase 3
- [ ] ยืนยันโดเมน **taladkaset.com** → ตั้ง `NEXT_PUBLIC_SITE_URL=https://taladkaset.com` ใน Vercel (โน้ต: โค้ด/แบรนด์ปัจจุบันใช้ชื่อ "KasetMarket" — ถ้าจะรีแบรนด์เป็น "ตลาดเกษตร/TaladKaset" ให้สั่งเป็นงานแยก แก้ที่ `config/site.ts` + layout + OG)

## 10. อ้างอิงจากการรีเสิร์ช (2026-07-12)

- MOC Open Data — ราคาสินค้าเกษตร + API: https://data.moc.go.th/OpenData/GISProductPrice · https://data.moc.go.th/developer (endpoint: `dataapi.moc.go.th/gis-product-price`)
- NABC/สศก. ราคารายวัน: https://www.nabc.go.th/daily-price · CKAN: https://nabc-catalog.oae.go.th · API: https://agriapi.nabc.go.th
- Shippop developer: http://developers.shippop.com · https://www.shippop.com/for-developers
- ไปรษณีย์ไทย EMS ส่งด่วนผลไม้ (เริ่ม 60฿/3กก.): https://www.thailandpost.co.th (ข่าว: khaosod/mgronline 2568)
- Nim Express ขนส่งควบคุมความเย็น: ตารางราคา via bsgroupth.com
- ราคาปศุสัตว์อ้างอิงประกาศสมาคม (ไข่ไก่คละ, สุกรหน้าฟาร์ม) — ไม่มี API ต้องกรอกมือ
