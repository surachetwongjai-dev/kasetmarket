// รีแบรนด์ข้อมูลใน DB: "KasetMarket" → "TaladKaset"
//
// ชื่อแบรนด์เก่าถูกเก็บเป็น "ข้อมูล" ใน DB ไม่ใช่แค่ในโค้ด (เช่นชื่อผู้ใช้แอดมิน
// "แอดมิน KasetMarket" ที่โชว์เป็นชื่อผู้ขายบนการ์ดประกาศทุกใบ) — แก้โค้ด/seed
// อย่างเดียวไม่พอ แถวเดิมใน DB ยังเป็นชื่อเก่า สคริปต์นี้แก้แถวเดิม
//
// รันซ้ำได้ ไม่มีผลข้างเคียง (แถวที่แก้แล้วจะไม่ match อีก)
//
//   dev:  npx tsx scripts/rebrand-taladkaset.ts
//   prod: npx --yes dotenv-cli -e .env.production-db -- npx tsx scripts/rebrand-taladkaset.ts
//
// ใส่ --dry เพื่อดูว่าจะแก้อะไรบ้างโดยไม่เขียนจริง

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OLD = "KasetMarket";
const NEW = "TaladKaset";
const dry = process.argv.includes("--dry");

/** แทนที่ทุกรูปแบบตัวพิมพ์ของแบรนด์เก่า (KasetMarket / kasetmarket) — ยกเว้นที่อยู่ในอีเมล/โดเมน */
function rebrand(s: string): string {
  // กัน admin@kasetmarket.dev และ kasetmarket-images (ตัวระบุภายใน คงไว้ตามเดิม)
  return s.replace(/KasetMarket(?![\w.-]*@)/gi, (m, offset: number, full: string) => {
    const before = full.slice(Math.max(0, offset - 1), offset);
    const after = full.slice(offset + m.length, offset + m.length + 1);
    if (before === "@" || after === "-" || after === ".") return m; // อีเมล/bucket/โดเมน
    return NEW;
  });
}

async function main() {
  console.log(dry ? "— DRY RUN (ไม่เขียนจริง) —" : "— เขียนจริง —");
  let total = 0;

  // 1) ชื่อผู้ใช้ (สำคัญสุด — โชว์เป็นชื่อผู้ขายบนหน้าสาธารณะ)
  const users = await prisma.user.findMany({
    where: { name: { contains: OLD, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  for (const u of users) {
    const next = rebrand(u.name);
    if (next === u.name) continue;
    console.log(`  user ${u.id}: "${u.name}" → "${next}"`);
    if (!dry) await prisma.user.update({ where: { id: u.id }, data: { name: next } });
    total++;
  }

  // 2) บทความ (title / excerpt / content)
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: OLD, mode: "insensitive" } },
        { excerpt: { contains: OLD, mode: "insensitive" } },
        { content: { contains: OLD, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, excerpt: true, content: true },
  });
  for (const a of articles) {
    const data = {
      title: rebrand(a.title),
      excerpt: rebrand(a.excerpt),
      content: rebrand(a.content),
    };
    console.log(`  article ${a.id}: "${a.title}" → "${data.title}"`);
    if (!dry) await prisma.article.update({ where: { id: a.id }, data });
    total++;
  }

  // 3) ประกาศ (title / description)
  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: OLD, mode: "insensitive" } },
        { description: { contains: OLD, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, description: true },
  });
  for (const l of listings) {
    const data = { title: rebrand(l.title), description: rebrand(l.description) };
    console.log(`  listing ${l.id}: "${l.title}" → "${data.title}"`);
    if (!dry) await prisma.listing.update({ where: { id: l.id }, data });
    total++;
  }

  console.log(total === 0 ? "ไม่พบข้อมูลที่ต้องแก้ ✅" : `${dry ? "จะแก้" : "แก้แล้ว"} ${total} แถว`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
