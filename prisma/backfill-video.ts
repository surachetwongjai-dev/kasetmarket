// Backfill youtubeUrl + videoUploadedAt ให้บทความ จากไฟล์ .md (title, source_video) + video_dates.tsv
// รัน: npx tsx prisma/backfill-video.ts "<โฟลเดอร์ที่มี article_*.md + video_dates.tsv>"
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

for (const line of readFileSync(join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const DIR = process.argv[2];
if (!DIR) {
  console.error("ต้องระบุโฟลเดอร์");
  process.exit(1);
}
const prisma = new PrismaClient();

function videoId(url: string): string | null {
  return (url.match(/[?&]v=([^&]+)/) || [])[1] ?? null;
}

async function main() {
  // id -> วันอัปโหลด
  const dates = new Map<string, Date>();
  for (const line of readFileSync(join(DIR, "video_dates.tsv"), "utf8").split(/\r?\n/)) {
    const [id, ymd] = line.trim().split(/\s+/);
    if (id && /^\d{8}$/.test(ymd)) {
      dates.set(
        id,
        new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8))),
      );
    }
  }

  const files = readdirSync(DIR).filter((f) => /^article_.*\.md$/.test(f));
  let updated = 0,
    noMatch = 0;
  for (const f of files) {
    const md = readFileSync(join(DIR, f), "utf8");
    const title = (md.match(/^title:\s*(.*)$/m) || [])[1]?.trim();
    const url = (md.match(/^source_video:\s*(.*)$/m) || [])[1]?.trim();
    if (!title || !url) {
      console.log(`SKIP(no fm)  ${f}`);
      continue;
    }
    const id = videoId(url);
    const uploadedAt = id ? dates.get(id) ?? null : null;
    const res = await prisma.article.updateMany({
      where: { title },
      data: { youtubeUrl: url, videoUploadedAt: uploadedAt },
    });
    if (res.count > 0) {
      updated += res.count;
      console.log(
        `OK  ${f}  (${res.count} row, date=${uploadedAt ? uploadedAt.toISOString().slice(0, 10) : "?"})`,
      );
    } else {
      noMatch++;
      console.log(`NO-MATCH  ${f}  (title ไม่ตรงกับใน DB)`);
    }
  }
  console.log(`\nอัปเดต ${updated} · ไม่พบ title ${noMatch}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
