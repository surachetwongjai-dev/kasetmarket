// Seed กระทู้ตั้งต้นชุมชน (C1) — หัวข้อชวนคุย/คำถามเปิด โพสในนามแอดมิน (เจ้าของช่อง)
// เพื่อ kickstart ฟอรัมก่อนเปิด FLAGS.COMMUNITY — ไม่มี reply ปลอม/บัญชีปลอม
// รัน: npx tsx scripts/seed-community.ts   (dev)
//      npx --yes dotenv-cli -e .env.production-db -- npx tsx scripts/seed-community.ts   (prod)
//
// idempotent: upsert ตาม slug คงที่ (ไม่มี suffix สุ่ม) — รันซ้ำไม่ duplicate
// และ "ไม่แตะ" pinned/views/repliesCount/lastReplyAt/hidden ที่มีอยู่ (คงกิจกรรมจริงหลังเปิดใช้)

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type SeedThread = {
  key: string; // ต่อท้าย slug ให้คงที่ (กันชนกับ slug ของผู้ใช้ที่มี suffix สุ่ม)
  title: string;
  body: string;
  category: string; // value จาก config/forumCategories.ts
  pinned?: boolean;
  daysAgo: number; // จัดเวลาให้ไล่กันดูเป็นธรรมชาติ (เฉพาะตอน create)
};

// หมวด: rice · field-crops · veg-fruit · livestock-fishery · fertilizer-disease
//       · machinery-tech · price-market · general
const THREADS: SeedThread[] = [
  {
    key: "welcome",
    title: "ยินดีต้อนรับสู่ชุมชนคนเกษตร taladkaset 🌱",
    body: `พื้นที่นี้ตั้งใจให้พี่น้องเกษตรกรได้มาคุยกัน ถาม-ตอบเรื่องการปลูก การเลี้ยง ปัญหาโรคแมลง ราคาผลผลิต และเทคนิคต่าง ๆ แบบเป็นกันเอง

กติกาง่าย ๆ: ถามได้ทุกเรื่องเกี่ยวกับเกษตร ช่วยกันตอบเท่าที่รู้ ไม่ว่ากันถ้าคำตอบต่างมุม งดโฆษณาขายของโต้ง ๆ (ลงประกาศขายไปที่หน้าประกาศได้เลย) และให้เกียรติกัน

เริ่มจากทักทายกันในกระทู้ "แนะนำตัว" ได้เลยครับ 🙏`,
    category: "general",
    pinned: true,
    daysAgo: 12,
  },
  {
    key: "intro",
    title: "แนะนำตัวกันหน่อย — คุณปลูก/เลี้ยงอะไร อยู่จังหวัดไหน",
    body: `อยากรู้จักเพื่อน ๆ ในชุมชนกันครับ มาบอกกันหน่อยว่าตอนนี้ทำเกษตรอะไรอยู่ ปลูกพืชอะไร เลี้ยงสัตว์แบบไหน พื้นที่กี่ไร่ อยู่จังหวัดไหน

เผื่อใครอยู่ใกล้กันจะได้แลกเปลี่ยน ช่วยเหลือ หรือรวมกลุ่มขายผลผลิตกันได้ครับ`,
    category: "general",
    pinned: true,
    daysAgo: 11,
  },
  {
    key: "rice-bph",
    title: "ช่วงนี้นาข้าวใครเริ่มออกรวงบ้าง เจอเพลี้ยกระโดดสีน้ำตาลไหม",
    body: `ปีนี้ฝนมาไม่สม่ำเสมอ นาแถวบ้านเริ่มตั้งท้อง-ออกรวงกันแล้ว อยากถามว่าปีนี้ใครเจอเพลี้ยกระโดดสีน้ำตาลระบาดบ้าง

ใครมีวิธีสังเกตช่วงแรก ๆ หรือวิธีจัดการที่ได้ผลไม่ต้องพึ่งสารเคมีหนัก ๆ มาแชร์กันหน่อยครับ`,
    category: "rice",
    daysAgo: 9,
  },
  {
    key: "rice-fertilizer-stage",
    title: "สูตรใส่ปุ๋ยข้าวตามระยะ ใครมีสูตรที่ใช้แล้วได้ผลมาแชร์กัน",
    body: `อยากรวบรวมสูตรใส่ปุ๋ยข้าวตามระยะการเจริญเติบโต ตั้งแต่ระยะแตกกอ ระยะกำเนิดช่อดอก จนถึงระยะออกรวง

เพื่อน ๆ ใช้สูตรไหน อัตราเท่าไหร่ต่อไร่ แล้วได้ผลผลิตประมาณกี่ถังต่อไร่ มาเล่าให้ฟังหน่อยครับ จะได้เป็นแนวทางให้คนอื่น`,
    category: "fertilizer-disease",
    daysAgo: 8,
  },
  {
    key: "rice-price",
    title: "ราคาข้าวเปลือกหอมมะลิสัปดาห์นี้ จังหวัดไหนล้งรับเท่าไหร่",
    body: `มาอัปเดตราคาข้าวเปลือกหอมมะลิกันครับ สัปดาห์นี้แถวบ้านใคร ล้ง/ท่าข้าวรับซื้อความชื้นมาตรฐานตันละเท่าไหร่

ลองบอกจังหวัดกับราคากันหน่อย จะได้เทียบกันว่าโซนไหนได้ราคาดี เผื่อวางแผนขายได้ครับ`,
    category: "price-market",
    daysAgo: 7,
  },
  {
    key: "cassava-worth",
    title: "มันสำปะหลังเชื้อแป้งต่ำช่วงฝน ราคานี้ขุดขายคุ้มไหม",
    body: `หน้าฝนเชื้อแป้งมันมักตก โดนหักเปอร์เซ็นต์เยอะ ราคาที่ลานรับตอนนี้บวกลบแล้วยังพอมีกำไรไหม

ใครขุดช่วงนี้ไปแล้วได้เชื้อแป้งเท่าไหร่ ราคาสุทธิที่ได้จริงเป็นยังไงบ้างครับ หรือควรรอให้พ้นหน้าฝนก่อน`,
    category: "field-crops",
    daysAgo: 6,
  },
  {
    key: "veg-rainy",
    title: "ปลูกผักหน้าฝน อะไรทนโรคและขายได้ราคาบ้าง",
    body: `หน้าฝนปลูกผักหลายอย่างเจอโรคเยอะ ทั้งเน่า ทั้งใบจุด อยากถามว่าเพื่อน ๆ ปลูกผักอะไรที่ทนหน้าฝนแล้วยังขายได้ราคา

มีเทคนิคเรื่องการยกแปลง คลุมพลาสติก หรือเลือกพันธุ์ยังไงให้รอดหน้าฝนบ้างครับ`,
    category: "veg-fruit",
    daysAgo: 5,
  },
  {
    key: "tilapia-cost",
    title: "เลี้ยงปลานิลบ่อดิน ต้นทุนอาหารต่อรอบตอนนี้สูงไหม",
    body: `กำลังคิดจะลงปลานิลบ่อดินเพิ่มอีกบ่อ แต่ราคาอาหารปลาขึ้นเยอะ อยากถามคนที่เลี้ยงอยู่ว่ารอบนึง (ประมาณ 4-5 เดือน) ต้นทุนอาหารต่อกิโลปลาที่จับได้ประมาณเท่าไหร่

แล้วตอนนี้ราคาปลานิลหน้าบ่อขายได้กิโลละเท่าไหร่ พอมีกำไรอยู่ไหมครับ`,
    category: "livestock-fishery",
    daysAgo: 4,
  },
  {
    key: "drone-spray",
    title: "โดรนพ่นยา สำหรับนา 20-30 ไร่ คุ้มค่าจ้างหรือซื้อเอง",
    body: `มีนาอยู่ประมาณ 20-30 ไร่ กำลังลังเลระหว่างจ้างโดรนพ่นยาเป็นครั้ง ๆ กับซื้อเครื่องมาใช้เอง

ใครใช้อยู่ช่วยเล่าหน่อยครับ ค่าจ้างพ่นตกไร่ละเท่าไหร่ ประหยัดยา/แรงงานได้จริงไหม แล้วถ้าซื้อเองคุ้มที่พื้นที่กี่ไร่ขึ้นไป`,
    category: "machinery-tech",
    daysAgo: 3,
  },
  {
    key: "durian-disease",
    title: "ทุเรียนหน้าฝน โรครากเน่าโคนเน่า/ใบไหม้ ป้องกันยังไงดี",
    body: `หน้าฝนทีไรทุเรียนเสี่ยงโรคไฟทอปธอรา ทั้งรากเน่าโคนเน่า ใบไหม้ กิ่งแห้ง

อยากถามชาวสวนทุเรียนว่าช่วงนี้ดูแลยังไง ทั้งเรื่องการระบายน้ำ การทาแผล การใช้ชีวภัณฑ์หรือสารป้องกัน มีแนวทางที่ได้ผลมาแชร์กันหน่อยครับ`,
    category: "fertilizer-disease",
    daysAgo: 2,
  },
  {
    key: "durian-price",
    title: "ทุเรียนหมอนทองปีนี้ ล้งแต่ละภาครับซื้อหน้าสวนกี่บาท",
    body: `มาอัปเดตราคาทุเรียนหมอนทองกันครับ ปีนี้ล้งแถวบ้านใครรับซื้อหน้าสวนกิโลละเท่าไหร่ เกรดส่งออกกับเกรดตลาดในประเทศต่างกันมากไหม

ช่วยบอกภาค/จังหวัดกับราคาด้วยครับ จะได้เห็นภาพรวมทั้งประเทศ`,
    category: "price-market",
    daysAgo: 1,
  },
  {
    key: "rice-seed-variety",
    title: "เมล็ดพันธุ์ข้าว กข ตัวไหนเพื่อน ๆ ปลูกแล้วให้ผลผลิตดี",
    body: `กำลังจะเปลี่ยนเมล็ดพันธุ์ข้าวสำหรับฤดูหน้า อยากได้ข้อมูลจากคนที่ปลูกจริง

ข้าว กข แต่ละเบอร์ (เช่น กข43, กข79, กข85 ฯลฯ) ตัวไหนต้านทานโรคดี ให้ผลผลิตต่อไร่สูง และขายได้ราคา เพื่อน ๆ ปลูกตัวไหนอยู่แล้วพอใจบ้างครับ`,
    category: "rice",
    daysAgo: 0,
  },
];

/** สร้าง slug ไทยคงที่ (ไม่มี suffix สุ่ม) ให้ upsert รันซ้ำได้ */
function stableSlug(title: string, key: string): string {
  const base = title
    .normalize("NFC")
    .replace(/[^\p{Script=Thai}a-zA-Z0-9]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
  return `${base}-c-${key}`;
}

async function main() {
  // ผู้เขียน = แอดมิน (เจ้าของช่อง) — ต้องมีอย่างน้อย 1 คน
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });
  if (!admin) {
    console.error(
      "✗ ไม่พบผู้ใช้ role ADMIN — สร้าง/โปรโมตแอดมินก่อน (scripts/promote-admin.ts) แล้วรันใหม่",
    );
    process.exit(1);
  }
  console.log(`ผู้เขียนกระทู้ seed: ${admin.name} <${admin.email ?? "-"}>`);

  const now = Date.now();
  let created = 0;
  let skipped = 0;

  for (const t of THREADS) {
    const slug = stableSlug(t.title, t.key);
    const when = new Date(now - t.daysAgo * 24 * 3600 * 1000);

    const existing = await prisma.thread.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      // อัปเดตเฉพาะเนื้อหา — ไม่แตะ pinned/views/repliesCount/lastReplyAt/hidden (คงกิจกรรมจริง)
      await prisma.thread.update({
        where: { slug },
        data: { title: t.title, body: t.body, category: t.category },
      });
      skipped++;
    } else {
      await prisma.thread.create({
        data: {
          slug,
          title: t.title,
          body: t.body,
          category: t.category,
          authorId: admin.id,
          pinned: t.pinned ?? false,
          createdAt: when,
          lastReplyAt: when,
        },
      });
      created++;
    }
  }

  const total = await prisma.thread.count();
  console.log(
    `seed ชุมชน: สร้างใหม่ ${created} · มีอยู่แล้ว(อัปเดตเนื้อหา) ${skipped} · กระทู้ทั้งหมดในระบบ ${total}`,
  );
}

main().finally(() => prisma.$disconnect());
