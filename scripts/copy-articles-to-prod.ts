// ก็อปบทความจริง (มี youtubeUrl = 18 เรื่องที่แปลงจากวิดีโอ) จาก DB dev → DB production
// ต้นทาง: .env (DB dev เดิม) — Prisma โหลดเองอัตโนมัติ
// ปลายทาง: .env.production-db (DB prod ใหม่)
// รันซ้ำได้ไม่ duplicate (skipDuplicates ด้วย slug/id เดิม)
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

function readEnvValue(file: string, key: string): string {
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${key}=`));
  if (!line) throw new Error(`${key} not found in ${file}`);
  return line.slice(line.indexOf("=") + 1).trim().replace(/^"|"$/g, "");
}

const source = new PrismaClient(); // DB dev จาก .env
const target = new PrismaClient({
  datasourceUrl: readEnvValue(".env.production-db", "DATABASE_URL"),
});

async function main() {
  const articles = await source.article.findMany({
    where: { youtubeUrl: { not: null } },
  });
  console.log(`ต้นทาง (dev): บทความจริง ${articles.length} เรื่อง`);

  const result = await target.article.createMany({
    data: articles,
    skipDuplicates: true,
  });
  console.log(`ก็อปเข้า prod: ${result.count} เรื่อง (ข้ามที่มีอยู่แล้ว)`);

  const total = await target.article.count();
  const sample = await target.article.findFirst({
    select: { title: true, published: true },
  });
  console.log(`ปลายทาง (prod) ตอนนี้มี ${total} เรื่อง — ตัวอย่าง: "${sample?.title}" (published: ${sample?.published})`);
}

main().finally(async () => {
  await source.$disconnect();
  await target.$disconnect();
});
