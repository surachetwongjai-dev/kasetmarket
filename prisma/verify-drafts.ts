// เช็คบทความร่างใน DB — รัน: npx tsx prisma/verify-drafts.ts
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

for (const line of readFileSync(join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.article.count();
  const published = await prisma.article.count({ where: { published: true } });
  const drafts = await prisma.article.count({ where: { published: false } });

  const byCat = await prisma.article.groupBy({
    by: ["category"],
    where: { published: false },
    _count: true,
  });

  console.log(`บทความทั้งหมดใน DB: ${total}  (เผยแพร่ ${published} · ร่าง ${drafts})`);
  console.log("ร่างแยกตามหมวด:");
  for (const c of byCat) console.log(`  ${c.category}: ${c._count}`);

  const list = await prisma.article.findMany({
    where: { published: false },
    select: { title: true, category: true, slug: true },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });
  console.log("\nรายการร่าง (ล่าสุดก่อน):");
  list.forEach((a, i) =>
    console.log(`  ${String(i + 1).padStart(2)}. [${a.category}] ${a.title}`),
  );

  await prisma.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
