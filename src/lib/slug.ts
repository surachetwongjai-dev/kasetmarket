// Slug generator ภาษาไทยสำหรับ SEO
// pattern: "ขายข้าวหอมมะลิ-สุรินทร์-x7f2" (CLAUDE.md §5)

const SUFFIX_CHARS = "abcdefghjkmnpqrstuvwxyz23456789"; // ตัด 0/o, 1/l/i กันอ่านสับสน

function randomSuffix(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  }
  return out;
}

/**
 * สร้าง slug จากข้อความไทย/อังกฤษ: เก็บอักษรไทย ตัวอักษร ตัวเลข,
 * แทนที่ช่องว่าง/อักขระอื่นด้วย "-" แล้วต่อท้ายด้วย suffix สุ่มกันซ้ำ
 */
export function generateSlug(...parts: (string | undefined | null)[]): string {
  const base = parts
    .filter(Boolean)
    .join("-")
    .normalize("NFC")
    .replace(/[^\p{Script=Thai}a-zA-Z0-9]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
  return `${base}-${randomSuffix()}`;
}
