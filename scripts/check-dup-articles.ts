// เทียบบทความที่ชื่อคล้ายกัน "ผสมปุ๋ยเคมีใช้เอง" ใน DB (read-only)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dups = await prisma.article.findMany({
    where: { title: { contains: "ผสมปุ๋ยเคมี" } },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      youtubeUrl: true,
      content: true,
    },
  });
  for (const a of dups) {
    console.log("---");
    console.log("slug:", a.slug);
    console.log("title:", a.title);
    console.log("youtube:", a.youtubeUrl);
    console.log("content length:", a.content.length);
    console.log("excerpt:", a.excerpt.slice(0, 120));
    console.log("content start:", a.content.slice(0, 150).replace(/\n/g, " "));
  }
}

main().finally(() => prisma.$disconnect());
