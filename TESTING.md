# TESTING.md — คู่มือเทส KasetMarket ก่อน Launch (M11)

> ติ๊ก `[x]` เมื่อผ่านแต่ละข้อ · เจอบั๊กจดไว้ท้ายไฟล์ในหัวข้อ "บั๊กที่เจอ"
> บัญชีทดสอบ (dev seed): **admin** `admin@kasetmarket.dev` / `admin1234` · ผู้ขายไม่ verified: `สมหญิง รักษ์เกษตร`

---

## Phase A — เทสในเครื่องก่อน deploy (localhost:3000)

### A0. เตรียมเครื่อง
- [ ] ปิด dev server ของ **ShopDash** (ต้องยึด port 3000 ให้ KasetMarket — OAuth callback ผูกกับ 3000)
- [ ] ตั้ง `NEXT_PUBLIC_SITE_URL="http://localhost:3000"` ใน `.env` (ตัวเดียวที่ยังขาด)
- [ ] `npx prisma migrate deploy` แล้ว `npx prisma db seed` (รีเซ็ตข้อมูลเป็น seed สะอาด: user 4, ประกาศ 20, บทความ 3)
- [ ] `npm run dev` → เปิด `http://localhost:3000` เห็นหน้าแรกมีประกาศ + ยืนยัน terminal ขึ้น port 3000 จริง (ไม่ใช่ 3001)

### A1. OAuth — งานค้างตั้งแต่ M3 ✅ ผ่านแล้ว (2026-07-10)
- [x] **LINE:** `/login` → กดปุ่ม LINE → อนุญาตในหน้า LINE → เด้งกลับเข้า `/dashboard` แสดงชื่อจาก LINE
- [x] **Google:** ออกจากระบบ → `/login` → กดปุ่ม Google → เลือกบัญชี → เด้งกลับ `/dashboard`
- [ ] เช็ค DB (`npx prisma studio`): user ใหม่ถูกสร้าง + มีแถวใน `Account` (OAuth linking) + role = SELLER
- [ ] ล็อกอินซ้ำด้วยช่องทางเดิม → เข้าบัญชีเดิม (ไม่สร้าง user ซ้ำ)

> ⚠️ ถ้า LINE เด้ง error `redirect_uri` → เข้า LINE Developers Console เช็ค callback = `http://localhost:3000/api/auth/callback/line` เป๊ะ (Google ก็เช็ค `.../callback/google`)

### A2. R2 image upload — งานค้างจาก M4 (ยังไม่เคยเทส R2 จริง)
- [ ] เข้าจากมือถือจริง: หา LAN IP เครื่อง (`ipconfig` → IPv4) → มือถือต่อ Wi-Fi เดียวกัน → เปิด `http://<IP>:3000`
      (ถ้าเข้าไม่ได้ ให้เทสอัปรูปบน desktop ก่อน แล้วไปยืนยันมือถือจริงอีกทีหลัง deploy)
- [ ] ล็อกอิน → `/dashboard/listings/new` → อัปรูปจากกล้องมือถือ **6 รูป** พร้อมกัน
- [ ] รูปขึ้น thumbnail ครบ + progress bar วิ่งจนเสร็จ ไม่มี error
- [ ] เช็คว่าไฟล์ไป R2 จริง (ไม่ใช่ `.uploads/` ในเครื่อง): เปิด URL รูปใน DevTools → host ต้องเป็น `*.r2.dev` หรือ custom domain
- [ ] ลองอัปรูปแนวตั้งจากกล้อง → รูปหมุนถูกด้าน (EXIF), ไฟล์ถูกบีบ < 500KB

### A3. Flow ผู้ขาย (Seller) — เต็มวงจร
- [ ] ผู้ขายที่ **ไม่ verified** ลงประกาศ → ขึ้นสถานะ **PENDING** + ข้อความ "รอตรวจ"
- [ ] ลงประกาศไม่ใส่ช่องทางติดต่อ (โทร/LINE) เลย → โดน validate บล็อก
- [ ] ลงประกาศไม่ใส่รูป → โดนบล็อก (บังคับ ≥1 รูป)
- [ ] แก้ไขประกาศ (เปลี่ยนราคา/รูป) → บันทึกแล้วค่าอัปเดตจริง
- [ ] กด "ขายแล้ว" → badge เปลี่ยนเป็น SOLD + ปุ่มหาย · ต่ออายุประกาศ EXPIRED → กลับ ACTIVE/PENDING · ลบ → หายจริง
- [ ] ลงประกาศ **ครบ 5 รายการในวันเดียว** → รายการที่ 6 โดน rate limit บล็อก
- [ ] Dashboard แสดงยอดวิวแต่ละประกาศ

### A4. Flow แอดมิน (Admin)
- [ ] ล็อกอิน admin (`admin@kasetmarket.dev`/`admin1234`) → `/admin` เห็นตัวเลข 4 ใบ (คิว/รายงาน/ประกาศใหม่/user)
- [ ] `/admin/moderation`: เห็นคิว PENDING → **approve** → ประกาศขึ้น `/listings` จริง
- [ ] **reject พร้อมเหตุผล** (≥5 ตัวอักษร) → ผู้ขายเห็นเหตุผลใน dashboard
- [ ] ผู้ขายแก้ประกาศที่โดน reject → กลับเข้าคิว PENDING อัตโนมัติ
- [ ] `/admin/users`: **verify** ผู้ขาย → ประกาศถัดไปของเขาขึ้น ACTIVE ทันที (ไม่เข้าคิว)
- [ ] **ban** ผู้ขาย → ผู้ขายคนนั้นล็อกอินด้วยรหัสถูกก็เข้าไม่ได้
- [ ] `/admin/reports`: กด "ปิดประกาศทันที" จากรายงาน → ประกาศหายจากเว็บ + resolve รายงาน
- [ ] `/admin/listings`: ตั้ง/ถอด featured → badge "ประกาศเด่น" เปลี่ยนจริงบนหน้า public
- [ ] CMS `/admin/articles/new`: เขียน Markdown → preview สดถูก → เผยแพร่ → ขึ้น `/articles` ทันที · เลิกเผยแพร่ → หาย

### A5. Flow ผู้ซื้อ (Buyer / public)
- [ ] `/listings`: filter หมวด + จังหวัด + ช่วงราคา + เรียง (ใหม่สุด/ถูกสุด) ถูกทุกคอมโบ
- [ ] ค้นหาไทย (เช่น "ข้าว", "ทุเรียน") ได้ผลถูก + ประกาศ REJECTED/PENDING ไม่โผล่
- [ ] หน้าประกาศรายตัว: gallery แตะสลับรูป, ป้ายราคาทองเด่น
- [ ] กด **"แสดงเบอร์"** → เบอร์โผล่ → กดโทร → เปิด `tel:` · กด LINE → เปิด line.me
- [ ] ปุ่มโทร/LINE **sticky ล่างจอบนมือถือ** (เลื่อนหน้าแล้วยังติดล่าง)
- [ ] กด "รายงาน" (ไม่ต้องล็อกอิน) → ลง DB · รายงานซ้ำวันเดิมโดนกัน
- [ ] "ประกาศใกล้เคียง" แสดง 4 รายการ (หมวด/จังหวัดเดียวกันก่อน)
- [ ] อ่านบทความ `/articles/[slug]` → Markdown render ครบ + วิดีโอ YouTube เล่นได้ + CTA ไปหมวดประกาศที่เกี่ยว
- [ ] โปรไฟล์ผู้ขาย `/sellers/[id]`: badge ยืนยัน + ประกาศ ACTIVE ทั้งหมด
- [ ] **Header session-aware:** ล็อกอินอยู่เห็นเมนูบัญชี / ล็อกเอาต์เห็นปุ่มเข้าสู่ระบบ

### A6. เทคนิค/มือถือ
- [ ] มือถือ 360–375px: ทุกหน้า **ไม่มี horizontal scroll**, ปุ่มหลักสูง ≥44px, ฟอนต์ body ≥16px
- [ ] `npm run build` ผ่าน (prebuild check-env ผ่าน) — ล้างข้อมูลทดสอบก่อน commit (seed ใหม่)

---

## Phase B — เทสบนโดเมนจริงหลัง deploy

### B0. Deploy
- [ ] ต่อ Vercel + ใส่ env ครบทุกตัวใน Vercel dashboard
- [ ] เปลี่ยน LINE + Google callback URL เป็น **โดเมนจริง** (`https://<domain>/api/auth/callback/{line,google}`)
- [ ] Build บน Vercel ผ่าน (check-env โหมดเข้มงวดต้องไม่ fail = env ครบจริง)
- [ ] `prisma migrate deploy` บน DB production + seed ข้อมูลจริงขั้นต่ำ (บทความ 15–20, ประกาศตั้งต้น 10–20)

### B1. ยืนยันบั๊กค้าง + คุณภาพ
- [ ] **soft-404:** เปิด URL ประกาศ/บทความมั่ว เช่น `https://<domain>/listings/ไม่มีจริง-xxxx`
      → เช็ค DevTools Network ว่า status = **404** (ถ้าเป็น 200 = soft-404 ยังอยู่ ดูโน้ต M10 ใน STATUS.md)
- [ ] **Lighthouse mobile ≥85** (Chrome DevTools → Lighthouse → Mobile) หน้าแรก + หน้าประกาศ
- [ ] **Rich Results Test** (search.google.com/test/rich-results): หน้าประกาศเจอ `Product`+`Offer`, บทความเจอ `Article`(+`VideoObject`)
- [ ] `https://<domain>/sitemap.xml` โหลดได้ + มี URL ประกาจ/บทความจริง · `/robots.txt` กัน /admin /dashboard
- [ ] Security headers ติด: DevTools → Network → หน้าใดหน้าหนึ่ง → Response Headers เห็น `x-frame-options`, `strict-transport-security` ฯลฯ

### B2. Flow เต็มจากมือถือจริง 4G (ปิด Wi-Fi)
- [ ] สมัคร/ล็อกอิน LINE บนมือถือจริง → ลงประกาศพร้อมอัปรูปจากกล้อง → admin (อีกเครื่อง) อนุมัติ → ประกาศขึ้นเว็บ
- [ ] ค้นหา + filter + กดโทร/LINE บนมือถือจริง ลื่นไหล ไม่ค้าง
- [ ] อ่านบทความ → วิดีโอ YouTube เล่นได้บน 4G

### B3. หลังผ่านหมด
- [ ] Google Search Console: submit sitemap
- [ ] ตั้ง Umami/Plausible analytics
- [ ] ให้ผู้เชี่ยวชาญกฎหมายตรวจร่าง /privacy /terms
- [ ] `git tag v1.0.0`

---

## บั๊กที่เจอ (จดระหว่างเทส)

<!-- ตัวอย่าง: A1 LINE login เด้ง error redirect_uri — แก้: ... -->
