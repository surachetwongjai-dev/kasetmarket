// ดูบทความใน DB (ตาม env ที่โหลด) — อ่านอย่างเดียว
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "asc" },
    select: {
      slug: true,
      title: true,
      category: true,
      published: true,
      coverUrl: true,
      youtubeUrl: true,
    },
  });
  console.log(`รวม ${articles.length} บทความ`);
  for (const a of articles) {
    const cover = a.coverUrl
      ? a.coverUrl.startsWith("/")
        ? "LOCAL!"
        : new URL(a.coverUrl).hostname
      : "-";
    console.log(
      `${a.published ? "PUB " : "DRAFT"} | ${a.category} | cover:${cover} | video:${a.youtubeUrl ? "yes" : "-"} | ${a.title.slice(0, 40)}`,
    );
  }
}

main().finally(() => prisma.$disconnect());
