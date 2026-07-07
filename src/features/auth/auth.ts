// NextAuth instance ตัวเต็ม (Node runtime เท่านั้น) — middleware ใช้ config.ts แทน

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./config";
import { loginSchema } from "./schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        // user ที่สมัครผ่าน OAuth จะไม่มี passwordHash → ล็อกอินด้วยรหัสผ่านไม่ได้
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return user;
      },
    }),
  ],
  events: {
    // เก็บ LINE user id ลง User.lineUserId (ใช้อ้างอิง/ติดต่อภายหลัง)
    async signIn({ user, account }) {
      if (account?.provider === "line" && user.id) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { lineUserId: account.providerAccountId },
          })
          .catch(() => {}); // ไม่ให้ล้ม flow ล็อกอินถ้า update ไม่สำเร็จ
      }
    },
  },
});
