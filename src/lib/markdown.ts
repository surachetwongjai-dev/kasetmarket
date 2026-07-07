// แปลง Markdown → HTML (server-only)
// ⚠️ ความปลอดภัย: บทความเขียนโดยแอดมิน (เจ้าของเว็บ) เท่านั้น ถือเป็น trusted content
// จึงไม่ sanitize output. ถ้าอนาคตเปิดให้ผู้ใช้อื่นเขียนบทความ ต้องเพิ่ม sanitize-html ก่อน

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false });
}

/** ตัด markdown ออกเป็นข้อความล้วน สำหรับ excerpt/meta description */
export function stripMarkdown(md: string, maxLength = 160): string {
  const text = md
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links → ข้อความ
    .replace(/[#>*_`~-]/g, "") // อักขระ markdown
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
