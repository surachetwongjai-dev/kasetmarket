// One-off: insert บทความจากไฟล์ .md (frontmatter + body) เข้า DB เป็น "ร่าง" (published:false)
// รัน: npx tsx prisma/insert-drafts.ts "<โฟลเดอร์ที่มีไฟล์ article_*.md>" [--dry]
// - parse frontmatter: title, category, excerpt (source_video ฝังใน body เป็น CTA อยู่แล้ว)
// - gen slug ไทย + suffix, ข้ามถ้ามี title ซ้ำใน DB (รันซ้ำได้ปลอดภัย)
// - Prisma Client ไม่โหลด .env เอง จึงโหลดเองด้านล่าง

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../src/lib/slug";
import { ARTICLE_CATEGORY_VALUES } from "../src/config/articleCategories";

// โหลด .env → process.env (ไม่ทับค่าที่ตั้งไว้แล้ว)
for (const line of readFileSync(join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const DIR = process.argv[2];
const DRY = process.argv.includes("--dry");
if (!DIR) {
  console.error("ต้องระบุโฟลเดอร์: npx tsx prisma/insert-drafts.ts <dir> [--dry]");
  process.exit(1);
}

const prisma = new PrismaClient();

type Parsed = { title: string; category: string; excerpt: string; content: string };

function parse(md: string): Parsed | null {
  const m = md.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!m) return null;
  const [, fm, body] = m;
  const get = (k: string) =>
    (fm.match(new RegExp("^" + k + ":\\s*(.*)$", "m")) || [])[1]?.trim() ?? "";
  return {
    title: get("title"),
    category: get("category"),
    excerpt: get("excerpt"),
    content: body.trim(),
  };
}

async function main() {
  const files = readdirSync(DIR)
    .filter((f) => /^article_.*\.md$/.test(f))
    .sort();

  let created = 0,
    skipped = 0,
    bad = 0;

  for (const f of files) {
    const a = parse(readFileSync(join(DIR, f), "utf8"));
    if (!a || !a.title || !a.category || !a.content) {
      console.log(`BAD(parse)  ${f}`);
      bad++;
      continue;
    }
    if (!ARTICLE_CATEGORY_VALUES.includes(a.category)) {
      console.log(`BAD(cat)    ${f}  -> "${a.category}"`);
      bad++;
      continue;
    }
    const dup = await prisma.article.findFirst({ where: { title: a.title } });
    if (dup) {
      console.log(`SKIP(dup)   ${f}`);
      skipped++;
      continue;
    }
    if (!DRY) {
      await prisma.article.create({
        data: {
          slug: generateSlug(a.title),
          title: a.title,
          excerpt: a.excerpt || a.title,
          content: a.content,
          category: a.category,
          published: false,
        },
      });
    }
    console.log(`${DRY ? "DRY-OK   " : "CREATED  "} ${f}  [${a.category}]`);
    created++;
  }

  console.log(
    `\n${DRY ? "[DRY] " : ""}สร้าง ${created} · ข้าม(ซ้ำ) ${skipped} · เสีย ${bad} · ไฟล์ทั้งหมด ${files.length}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
