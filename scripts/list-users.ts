// ดูรายชื่อ user ใน DB ที่ env ชี้อยู่ (read-only)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      verified: true,
      banned: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.table(
    users.map((u) => ({
      email: u.email ?? "(ไม่มี)",
      name: u.name,
      role: u.role,
      verified: u.verified,
      banned: u.banned,
    })),
  );
  console.log(`รวม ${users.length} user`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
