// กันเส้นทางที่ต้องล็อกอิน — logic จริงอยู่ใน authorized() callback (features/auth/config.ts)
// ใช้ authConfig (ไม่มี adapter/prisma) เพราะ middleware รันบน Edge runtime

import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
