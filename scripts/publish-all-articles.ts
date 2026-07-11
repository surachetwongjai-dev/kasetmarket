// เผยแพร่บทความ DRAFT ทั้งหมด (เฉพาะบทความจริงที่มี youtubeUrl)
// ตั้ง publishedAt ไล่ห่างกัน 1 นาทีตามลำดับวันที่วิดีโอ เพื่อให้หน้า list เรียงลำดับคงที่
// ใช้: npx dotenv-cli -e .env.production.local -- npx tsx scripts/publish-all-articles.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const drafts = await prisma.article.findMany({
    where: { published: false, youtubeUrl: { not: null } },
    orderBy: { videoUploadedAt: "asc" },
    select: { id: true, title: true },
  });
  console.log(`พบ DRAFT ${drafts.length} เรื่อง`);

  const now = Date.now();
  for (let i = 0; i < drafts.length; i++) {
    // เรื่องที่วิดีโอเก่าสุดได้ publishedAt เก่าสุด (now - (n-i) นาที)
    const publishedAt = new Date(now - (drafts.length - i) * 60_000);
    await prisma.article.update({
      where: { id: drafts[i].id },
      data: { published: true, publishedAt },
    });
    console.log(`✓ ${drafts[i].title.slice(0, 50)}`);
  }

  const total = await prisma.article.count({ where: { published: true } });
  console.log(`\nเผยแพร่แล้วทั้งหมด ${total} เรื่อง`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
