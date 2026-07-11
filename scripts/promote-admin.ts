// เลื่อน user เป็น ADMIN + verified — ระบุอีเมลเป็น argument กันพลาดคนผิด
// ใช้: npx dotenv-cli -e .env.production.local -- npx tsx scripts/promote-admin.ts <email>
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("ต้องระบุอีเมล: tsx scripts/promote-admin.ts <email>");

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN", verified: true },
    select: { email: true, name: true, role: true, verified: true },
  });
  console.log("เลื่อนสิทธิ์สำเร็จ:", user);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
