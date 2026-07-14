// ตั้งให้ "อีเมลเดียว" เป็นแอดมินเพียงบัญชีเดียวในระบบ
// - เลื่อนบัญชีเป้าหมายเป็น ADMIN + verified
// - ถอดสิทธิ์แอดมินของบัญชีอื่นทั้งหมด → SELLER
// ปลอดภัย: ถ้าหาอีเมลเป้าหมายไม่เจอ = ยกเลิก (ไม่ถอดใครเลย กันเหลือ 0 แอดมิน)
//
// ใช้ (prod):
//   npx --yes dotenv-cli -e .env.production-db -- npx tsx scripts/set-sole-admin.ts <email>
// ใช้ (dev):
//   npx tsx scripts/set-sole-admin.ts <email>

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    throw new Error(
      "ต้องระบุอีเมล: tsx scripts/set-sole-admin.ts <email>  (เช่น thanakorn10@gmail.com)",
    );
  }

  // 1) หาบัญชีเป้าหมายก่อน — ไม่เจอ = หยุด (อย่าถอดใคร)
  const target = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, verified: true },
  });
  if (!target) {
    throw new Error(
      `✗ ไม่พบบัญชีอีเมล "${email}" ในฐานข้อมูลนี้ — ยกเลิก (ไม่แตะสิทธิ์ใครเลย)\n` +
        `  ตรวจว่าพิมพ์อีเมลถูก และรันกับฐานข้อมูลที่ถูกต้อง (prod ต้องผ่าน dotenv-cli -e .env.production-db)`,
    );
  }

  // 2) สถานะแอดมินปัจจุบัน (ก่อนแก้)
  const before = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  console.log("แอดมินก่อนแก้:");
  console.table(before.map((u) => ({ email: u.email ?? "(ไม่มี)", name: u.name })));

  // 3) ทำในทรานแซกชันเดียว: เลื่อนเป้าหมาย + ถอดคนอื่น
  const [, demoted] = await prisma.$transaction([
    prisma.user.update({
      where: { id: target.id },
      data: { role: "ADMIN", verified: true },
    }),
    prisma.user.updateMany({
      where: { role: "ADMIN", id: { not: target.id } },
      data: { role: "SELLER" },
    }),
  ]);

  // 4) ยืนยันผล
  const after = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true },
  });
  console.log(
    `\n✓ เสร็จ — เลื่อน ${target.email} เป็น ADMIN+verified · ถอดแอดมินอื่น ${demoted.count} บัญชี`,
  );
  console.log("แอดมินหลังแก้ (ควรเหลือบัญชีเดียว):");
  console.table(after.map((u) => ({ email: u.email ?? "(ไม่มี)", name: u.name })));
  if (after.length !== 1) {
    console.warn(`⚠️ จำนวนแอดมิน = ${after.length} (คาดว่า 1) — ตรวจสอบเพิ่มเติม`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
