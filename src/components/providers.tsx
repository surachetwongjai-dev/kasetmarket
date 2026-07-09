"use client";

// ครอบ SessionProvider ให้ทั้งแอป — ทำให้ header อ่าน session ฝั่ง client ได้
// โดยไม่ต้องเรียก auth() ใน layout (ซึ่งจะทำให้หน้า public ทุกหน้ากลายเป็น dynamic เสีย ISR)
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
