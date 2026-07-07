// Auth config ส่วนที่ edge-safe (ใช้ใน middleware ได้ — ห้าม import prisma/bcrypt ที่นี่)
// Credentials provider อยู่ใน auth.ts เพราะต้องใช้ database

import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import Line from "next-auth/providers/line";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  // Credentials provider ใช้ได้เฉพาะ JWT session (ไม่ใช่ database session)
  session: { strategy: "jwt" },
  callbacks: {
    // gate /dashboard/* (ต้องล็อกอิน) และ /admin/* (ต้อง ADMIN) — เรียกจาก middleware
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      if (!user) return false; // เด้งไป pages.signIn
      if (nextUrl.pathname.startsWith("/admin") && user.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      // ตอน sign-in ครั้งแรก user มาจาก DB (adapter) หรือจาก authorize() — เก็บ role ลง token
      if (user) {
        token.role = (user.role ?? "SELLER") as Role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role ?? "SELLER") as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
