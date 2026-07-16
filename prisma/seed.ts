// Seed ข้อมูลทดสอบ (M2): admin 1, seller 3, ประกาศ 20 กระจายหมวด/จังหวัด, บทความ 3
// รัน: npx prisma db seed — ลบข้อมูลเก่าทั้งหมดก่อนทุกครั้ง (dev เท่านั้น)

import { PrismaClient, ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateSlug } from "../src/lib/slug";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

function placeholderImages(seedKey: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/${encodeURIComponent(seedKey)}-${i}/800/600`,
    order: i,
  }));
}

async function main() {
  // ล้างข้อมูลเก่า (ลำดับตาม FK)
  await prisma.report.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Users ----------
  const admin = await prisma.user.create({
    data: {
      role: "ADMIN",
      name: "แอดมิน TaladKaset",
      // login ทดสอบ (dev เท่านั้น): admin@kasetmarket.dev / admin1234
      email: "admin@kasetmarket.dev",
      passwordHash: bcrypt.hashSync("admin1234", 12),
      phone: "0810000001",
      province: "อุบลราชธานี",
      verified: true,
    },
  });

  const somchai = await prisma.user.create({
    data: {
      name: "ลุงสมชาย ใจดี",
      phone: "0891112222",
      lineUserId: "line-somchai-mock",
      province: "สุรินทร์",
      verified: true,
    },
  });

  const boonmee = await prisma.user.create({
    data: {
      name: "ป้าบุญมี ผลไม้หวาน",
      phone: "0862223333",
      lineUserId: "line-boonmee-mock",
      province: "จันทบุรี",
      verified: true,
    },
  });

  const somying = await prisma.user.create({
    data: {
      name: "สมหญิง รักษ์เกษตร",
      phone: "0653334444",
      province: "นครราชสีมา",
      verified: false, // ยังไม่ verified → ประกาศเข้าคิว PENDING
    },
  });

  const sellers = [somchai, boonmee, somying];

  // ---------- Listings (20 รายการ, หมวดละ 2) ----------
  type SeedListing = {
    title: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    province: string;
    district?: string;
    status?: ListingStatus;
    featured?: boolean;
    negotiable?: boolean;
    imageCount?: number;
  };

  const listings: SeedListing[] = [
    // ข้าว/ข้าวเปลือก
    { title: "ขายข้าวหอมมะลิ 105 เกี่ยวใหม่ ความชื้นต่ำ", description: "ข้าวเปลือกหอมมะลิ 105 เกี่ยวสดจากนา ความชื้น 15% ตากแห้งพร้อมสี มีจำนวน 30 ตัน รับเองที่นาหรือคุยเรื่องขนส่งได้", price: 12500, unit: "ton", category: "rice", province: "สุรินทร์", district: "ปราสาท", featured: true, imageCount: 3 },
    { title: "ข้าวไรซ์เบอร์รี่อินทรีย์ สีใหม่ บรรจุถุง 5 กก.", description: "ข้าวไรซ์เบอร์รี่ปลูกแบบอินทรีย์ ไม่ใช้สารเคมี สีใหม่ทุกสัปดาห์ บรรจุถุงสุญญากาศ 5 กก. สั่งขั้นต่ำ 2 ถุง ส่งทั่วประเทศ", price: 450, unit: "bag", category: "rice", province: "ยโสธร" },
    // ผัก
    { title: "คะน้าปลอดสาร ตัดสดทุกเช้า", description: "คะน้าปลอดสารพิษ ตัดสดจากแปลงทุกเช้า มีทุกวัน วันละ 100-200 กก. เหมาะร้านอาหาร โรงแรม ตลาดสด", price: 35, unit: "kg", category: "vegetables", province: "นครปฐม", district: "กำแพงแสน", imageCount: 2 },
    { title: "พริกขี้หนูสวนแดงจัด เผ็ดถึงใจ", description: "พริกขี้หนูสวนเก็บมือ สีแดงสวย เผ็ดหอม มีทั้งสดและตากแห้ง ราคาคุยกันได้ตามปริมาณ", price: 120, unit: "kg", category: "vegetables", province: "เชียงใหม่" },
    // ผลไม้
    { title: "ทุเรียนหมอนทองเกรด A ตัดสุกจากสวน", description: "ทุเรียนหมอนทองแท้จันทบุรี ตัดแก่จัด รับประกันไม่อ่อน น้ำหนักลูกละ 3-5 กก. มีบริการส่งทั่วประเทศ เจ้าของสวนขายเอง", price: 145, unit: "kg", category: "fruits", province: "จันทบุรี", district: "ท่าใหม่", featured: true, imageCount: 3 },
    { title: "มะม่วงน้ำดอกไม้สีทอง ส่งออกเกรด", description: "มะม่วงน้ำดอกไม้สีทองคุณภาพส่งออก ผิวสวย หวานหอม แพ็คกล่อง 10 กก. รับออเดอร์ล่วงหน้า 3 วัน", price: 80, unit: "kg", category: "fruits", province: "ฉะเชิงเทรา", status: "SOLD" },
    // พืชไร่
    { title: "มันสำปะหลังหัวใหญ่ แป้งดี พร้อมขุด", description: "มันสำปะหลังพันธุ์ระยอง 72 อายุ 10 เดือน แป้ง 28% พื้นที่ 40 ไร่ ขายยกแปลงหรือแบ่งขายได้ มีลานรับซื้อใกล้", price: 3.2, unit: "kg", category: "field-crops", province: "นครราชสีมา", district: "ด่านขุนทด" },
    { title: "ข้าวโพดเลี้ยงสัตว์ ความชื้น 14.5%", description: "ข้าวโพดเลี้ยงสัตว์อบแห้ง ความชื้น 14.5% เมล็ดสวยไม่มีเชื้อรา มี 20 ตัน พร้อมส่งภายในสัปดาห์", price: 9800, unit: "ton", category: "field-crops", province: "เพชรบูรณ์" },
    // ต้นกล้า-เมล็ดพันธุ์
    { title: "ต้นกล้ามะนาวแป้นพิจิตร พร้อมปลูก", description: "กิ่งตอนมะนาวแป้นพิจิตร 1 รากแข็งแรง สูง 50-70 ซม. พร้อมลงดิน ซื้อ 100 ต้นขึ้นไปมีส่วนลด จัดส่งทั่วประเทศ", price: 35, unit: "tree", category: "seedlings", province: "พิจิตร", imageCount: 2 },
    { title: "เมล็ดพันธุ์ข้าวหอมมะลิ 105 คัดพิเศษ", description: "เมล็ดพันธุ์ข้าวหอมมะลิ 105 คัดจากแปลงพันธุ์ งอกดี 90%+ บรรจุกระสอบ 25 กก. เหมาะทำนาปี", price: 550, unit: "sack", category: "seedlings", province: "ร้อยเอ็ด", status: "PENDING" },
    // ปุ๋ย-ฮอร์โมน
    { title: "ปุ๋ยคอกวัวแท้ ตากแห้ง ไม่ผสมดิน", description: "ขี้วัวแท้ 100% ตากแห้งพร้อมใช้ ไม่ผสมดินไม่ผสมแกลบ กระสอบละ 30 กก. รับเองถูกกว่า มีจำนวนมาก", price: 60, unit: "sack", category: "fertilizer", province: "ลพบุรี", imageCount: 2 },
    { title: "น้ำหมักฮอร์โมนไข่ สูตรเร่งดอกผล", description: "ฮอร์โมนไข่หมักครบ 3 เดือน สูตรตามกรมพัฒนาที่ดิน ใช้เร่งดอกเร่งผล บรรจุแกลลอน 5 ลิตร", price: 150, unit: "piece", category: "fertilizer", province: "อุบลราชธานี", status: "PENDING" },
    // สัตว์เลี้ยงเกษตร
    { title: "ลูกวัวบราห์มันแท้ เพศผู้ 8 เดือน", description: "ลูกวัวบราห์มันเลือดสูง เพศผู้ อายุ 8 เดือน โครงใหญ่ สุขภาพดี ทำวัคซีนครบ มีใบรับรอง ดูวัวได้ที่ฟาร์ม", price: 28000, unit: "animal", category: "livestock", province: "สกลนคร", featured: true, imageCount: 3 },
    { title: "ไก่ไข่สาวพร้อมไข่ พันธุ์โรดไอส์แลนด์", description: "ไก่ไข่สาวอายุ 17 สัปดาห์ ใกล้ให้ไข่ แข็งแรง วัคซีนครบโปรแกรม สั่ง 50 ตัวขึ้นไปส่งฟรีในจังหวัดใกล้เคียง", price: 185, unit: "animal", category: "livestock", province: "ชลบุรี" },
    // เครื่องจักร-อุปกรณ์
    { title: "รถไถเดินตามมือสอง คูโบต้า สภาพดี", description: "รถไถเดินตามคูโบต้า RT100 มือสอง ใช้งาน 3 ปี เครื่องแน่น พร้อมผานและล้อเหล็ก เจ้าของขายเอง ดูของได้", price: 28000, unit: "machine", category: "machinery", province: "นครราชสีมา", district: "พิมาย", imageCount: 3 },
    { title: "เครื่องพ่นยาแบตเตอรี่ 20 ลิตร ของใหม่", description: "เครื่องพ่นยาสะพายหลังแบตเตอรี่ ถัง 20 ลิตร แบตอึดพ่นได้ทั้งวัน มีอะไหล่พร้อม ประกัน 6 เดือน", price: 1590, unit: "machine", category: "machinery", province: "ขอนแก่น" },
    // ที่ดิน-สวน-นา
    { title: "ขายนาพร้อมทำ 15 ไร่ ติดคลองส่งน้ำ", description: "นาข้าว 15 ไร่ ติดคลองชลประทาน น้ำถึงตลอดปี เอกสารโฉนดพร้อมโอน ถนนคอนกรีตถึงแปลง ราคาต่อไร่", price: 180000, unit: "rai", category: "land", province: "สุพรรณบุรี", negotiable: true },
    { title: "สวนทุเรียน 8 ไร่ ต้นให้ผลแล้ว 60 ต้น", description: "สวนทุเรียนหมอนทอง 8 ไร่ ต้นอายุ 7 ปี ให้ผลแล้ว 60 ต้น มีบ่อน้ำ ระบบสปริงเกอร์ครบ ขายยกสวนพร้อมอุปกรณ์ ราคาเหมา", price: 4500000, unit: "lump-sum", category: "land", province: "ระยอง", status: "REJECTED" },
    // อื่นๆ
    { title: "รับจ้างไถนา ไถกลบ ราคาเป็นกันเอง", description: "บริการรถไถรับจ้าง ไถดะ ไถแปร ไถกลบตอซัง พื้นที่สุรินทร์และใกล้เคียง คิวว่างตลอดเดือนนี้ ราคาต่อไร่", price: 300, unit: "rai", category: "others", province: "สุรินทร์" },
    { title: "ฟางอัดก้อน แห้งสนิท เก็บในร่ม", description: "ฟางข้าวอัดก้อนแห้งสนิท เก็บในโรงเรือนไม่โดนฝน เหมาะเลี้ยงวัว คลุมแปลงผัก มี 500 ก้อน ยกคันรถมีราคาส่ง", price: 45, unit: "piece", category: "others", province: "อุดรธานี", imageCount: 2 },
  ];

  let listingCount = 0;
  for (const [i, l] of listings.entries()) {
    const seller = sellers[i % sellers.length];
    // ผู้ขายยังไม่ verified → PENDING เสมอ (กติกา CLAUDE.md §8) ยกเว้น status ที่กำหนดมาเอง
    const status: ListingStatus =
      l.status ?? (seller.verified ? "ACTIVE" : "PENDING");
    const slug = generateSlug(l.title.split(" ")[0], l.province);
    await prisma.listing.create({
      data: {
        slug,
        title: l.title,
        description: l.description,
        price: l.price,
        unit: l.unit,
        negotiable: l.negotiable ?? true,
        category: l.category,
        province: l.province,
        district: l.district,
        contactPhone: seller.phone,
        contactLine: seller.lineUserId ? `@${seller.name.split(" ")[0]}` : null,
        status,
        featured: l.featured ?? false,
        views: Math.floor(Math.random() * 500),
        expiresAt: daysFromNow(30),
        sellerId: seller.id,
        createdAt: new Date(Date.now() - i * 5 * 60 * 60 * 1000), // กระจายเวลาโพสย้อนหลัง
        images: { create: placeholderImages(slug, l.imageCount ?? 1) },
      },
    });
    listingCount++;
  }

  // ---------- Articles ----------
  const articles = [
    {
      title: "ใส่ปุ๋ยข้าวตามระยะ ให้ถูกสูตร ถูกเวลา ได้ผลผลิตเต็มเม็ด",
      excerpt:
        "สรุปการใส่ปุ๋ยนาข้าว 3 ช่วงสำคัญ ตั้งแต่ปุ๋ยรองพื้น ปุ๋ยแตกกอ จนถึงปุ๋ยรับรวง พร้อมสูตรและอัตราที่ใช้จริง",
      category: "ปุ๋ย",
      content: `การใส่ปุ๋ยข้าวให้ได้ผล ต้องใส่ให้ตรงกับความต้องการของต้นข้าวแต่ละระยะ ไม่ใช่ใส่ครั้งเดียวจบ

## ระยะที่ 1 — ปุ๋ยรองพื้น (ตอนเตรียมดิน/หลังหว่าน 15-20 วัน)

ใช้สูตร **16-20-0** (นาดินเหนียว) หรือ **16-16-8** (นาดินทราย) อัตรา 25-30 กก./ไร่ ช่วงนี้ข้าวต้องการฟอสฟอรัสสร้างราก

## ระยะที่ 2 — ปุ๋ยแตกกอ (ข้าวอายุ 30-35 วัน)

ใช้ยูเรีย **46-0-0** อัตรา 10-15 กก./ไร่ เร่งการแตกกอ ยิ่งกอเยอะรวงยิ่งเยอะ ใส่ตอนน้ำในนาพอดี ไม่ท่วมไม่แห้ง

## ระยะที่ 3 — ปุ๋ยรับรวง (ก่อนข้าวตั้งท้อง 55-60 วัน)

ใช้ **46-0-0 ผสม 0-0-60** อย่างละ 10 กก./ไร่ ช่วยให้รวงใหญ่ เมล็ดเต่ง น้ำหนักดี

> ข้อควรระวัง: อย่าใส่ยูเรียหลังข้าวออกรวงแล้ว จะทำให้ข้าวใบงามแต่เมล็ดลีบ และล้มง่าย`,
    },
    {
      title: "ฮอร์โมนไข่สูตรเข้มข้น ทำเองได้ ต้นทุนไม่ถึงร้อย",
      excerpt:
        "วิธีหมักฮอร์โมนไข่ใช้เอง สูตรมาตรฐานกรมพัฒนาที่ดิน ช่วยเร่งดอก เพิ่มการติดผล ใช้ได้ทั้งนาข้าว ผัก และไม้ผล",
      category: "เทคนิค",
      content: `ฮอร์โมนไข่คือสูตรน้ำหมักยอดนิยมที่เกษตรกรทำใช้เองได้ ต้นทุนต่ำแต่ได้ผลจริง โดยเฉพาะช่วงเร่งดอกและบำรุงผล

## วัตถุดิบ

- ไข่ไก่ทั้งฟอง (รวมเปลือก) 5 กก.
- กากน้ำตาล 5 กก.
- ยาคูลท์หรือนมเปรี้ยว 1 ขวด
- ลูกแป้งข้าวหมาก 1 ลูก

## วิธีทำ

1. ตีไข่ทั้งเปลือกให้ละเอียด
2. ผสมกากน้ำตาล ยาคูลท์ และลูกแป้งบดละเอียด คนให้เข้ากัน
3. หมักในถังปิดฝาไม่สนิท (ให้แก๊สระบายได้) เก็บในที่ร่ม
4. คนทุก 2-3 วัน หมักครบ **21 วัน** ขึ้นไปจึงใช้ได้

## อัตราการใช้

ผสมน้ำ 20 ซีซี ต่อน้ำ 20 ลิตร ฉีดพ่นตอนเช้าหรือเย็น ทุก 7 วัน ช่วงก่อนออกดอกและช่วงติดผลอ่อน`,
    },
    {
      title: "ตารางฉีดพ่นนาข้าวตลอดฤดู ฉีดอะไร ตอนไหน กันโรคอะไร",
      excerpt:
        "ตารางเดียวจบ ฉีดพ่นนาข้าวตั้งแต่หว่านถึงเก็บเกี่ยว ทั้งกันหนอน กันเพลี้ย กันโรคไหม้ พร้อมช่วงเวลาที่ห้ามพลาด",
      category: "โรคพืช",
      content: `การฉีดพ่นนาข้าวให้ได้ผล ต้องฉีดตามระยะการเจริญเติบโต ไม่ใช่รอให้เจอโรคแล้วค่อยแก้

## ช่วงที่ 1: ข้าวอายุ 20-30 วัน (ระยะกล้า-แตกกอต้น)

เฝ้าระวัง **เพลี้ยไฟ** และ **หนอนกระทู้กล้า** — สำรวจใบทุก 3 วัน ถ้าพบใบม้วนหรือปลายใบแห้งให้รีบจัดการ ช่วงนี้ใช้ชีวภัณฑ์ เช่น บิวเวอเรีย ได้ผลดีและปลอดภัย

## ช่วงที่ 2: ข้าวอายุ 40-60 วัน (แตกกอเต็มที่-ตั้งท้อง)

จุดเสี่ยง **โรคไหม้** และ **เพลี้ยกระโดดสีน้ำตาล** — ถ้าใส่ยูเรียหนัก ใบจะเขียวจัด ยิ่งล่อเพลี้ย อย่าฉีดสารเคมีกลุ่มเดิมซ้ำเกิน 2 ครั้งติดต่อกัน เพลี้ยจะดื้อยา

## ช่วงที่ 3: ข้าวออกรวง-น้ำนม

ระวัง **โรคไหม้คอรวง** (สำคัญที่สุด เสียหายตรงรายได้) และ **เพลี้ยจักจั่นสีเขียว** — ฉีดกันโรคไหม้คอรวงช่วงข้าวโผล่รวง 5-10% หนึ่งครั้ง และซ้ำตอนรวงโผล่พ้น 80%

> เคล็ดลับ: ฉีดพ่นตอนเช้าก่อน 9 โมง หรือเย็นหลัง 4 โมง อากาศนิ่ง ยาเกาะใบดีกว่า และปลอดภัยต่อคนฉีด`,
    },
  ];

  for (const [i, a] of articles.entries()) {
    await prisma.article.create({
      data: {
        slug: generateSlug(a.title.slice(0, 40)),
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        coverUrl: `https://picsum.photos/seed/article-${i}/1200/630`,
        category: a.category,
        published: true,
        publishedAt: new Date(Date.now() - i * 2 * DAY_MS),
        views: Math.floor(Math.random() * 1000),
      },
    });
  }

  console.log(
    `Seed เสร็จ: users ${1 + sellers.length}, listings ${listingCount}, articles ${articles.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
