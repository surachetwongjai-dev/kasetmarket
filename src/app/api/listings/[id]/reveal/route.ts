// POST /api/listings/:id/reveal?channel=phone|line
// บันทึกเหตุการณ์กดดูช่องทางติดต่อ (T0) — ยิงจาก ContactButtons ตอนยืนยันดูเบอร์/กด LINE
// ด้วย sendBeacon (แพทเทิร์นเดียวกับ ViewTracker) เก็บ userId ถ้าล็อกอิน เพื่อใช้ gate รีวิว (T2)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth/auth";

// rate limit ต่อ IP — in-memory ต่อ instance (รีเซ็ตเมื่อ cold start; ยอมรับได้ เพราะเป็นแค่ log)
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 60; // กันสแปม log — ผู้ใช้จริงดูเบอร์ไม่กี่ครั้ง/ชม.
const hits = new Map<string, number[]>();

function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // กัน map โตไม่จำกัด
  return true;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const channel = new URL(request.url).searchParams.get("channel");
  if (channel !== "phone" && channel !== "line") {
    return NextResponse.json({ error: "channel ไม่ถูกต้อง" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) {
    // เงียบๆ — ไม่ให้ client error, แค่ไม่ log เพิ่ม
    return NextResponse.json({ ok: true });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  // create ตรงๆ แล้ว catch FK error (id ประกาศไม่มีจริง/ถูกลบ) — ไม่ throw ให้ client
  await prisma.contactReveal
    .create({ data: { listingId: id, userId, channel } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
